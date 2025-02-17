use std::sync::Arc;
use crate::error::ContractError;
use crate::error::ContractError::{InvalidAction, InvalidSolution};
use crate::game::{GameSolution, PlayerContribution, SudokuGame};
use crate::logic::check_solution;
use crate::state::{GlobalState, GAME_STORAGE, OWNER, OWNER_PROFIT, VERIFIER, VK};
use candid::Principal;
use ic_cdk::{api, call};
use ic_ledger_types::{AccountIdentifier, Memo, Tokens, DEFAULT_SUBACCOUNT, MAINNET_LEDGER_CANISTER_ID};

#[cfg_attr(not(feature = "library"), ic_cdk::init)]
fn instantiate(vk: String, verifier_address: Principal) {
    VK.set(vk);
    OWNER.set(api::caller());
    VERIFIER.set(verifier_address);
}

#[cfg_attr(not(feature = "library"), ic_cdk::query)]
fn get_battle_info(id: usize) -> Result<SudokuGame, ContractError> {
    GAME_STORAGE.with(|games| {
        let games = games.borrow();
        if id >= games.len() {
            return Err(InvalidAction("battle not found".to_string()));
        }
        Ok(games[id].clone())
    })
}

#[cfg_attr(not(feature = "library"), ic_cdk::query)]
fn get_global_state() -> GlobalState {
    GlobalState {
        owner: OWNER.with(|owner| *owner.borrow()),
        vk: VK.with(|vk| vk.borrow().clone()),
        owner_profit: OWNER_PROFIT.with(|profit| profit.borrow().clone()),
        verifier: VERIFIER.with(|verifier| *verifier.borrow()),
    }
}

#[cfg_attr(not(feature = "library"), ic_cdk::update)]
fn create_new_battle(
    deposit_price: u128,
    service_fee: u128,
    creator: Principal,
) -> Result<usize, ContractError> {
    OWNER.with_borrow(|owner| {
        if *owner != api::caller() {
            return Err(InvalidAction("only owner can create a battle".to_string()));
        }
        Ok(())
    })?;

    GAME_STORAGE.with_borrow_mut(|game| {
        let new_battle_id = game.len();
        game.push(SudokuGame {
            initial_state: None,
            creator,
            deposit_price,
            service_fee,
            players: vec![],
            solution: None,
            winners: None,
            claimed: false,
        });
        Ok(new_battle_id)
    })
}

#[cfg_attr(not(feature = "library"), ic_cdk::update)]
fn join_battle(battle_id: usize, player: Principal) -> Result<(), ContractError> {
    OWNER.with_borrow(|owner| {
        if *owner != api::caller() {
            return Err(InvalidAction("only owner can add player".to_string()));
        }
        Ok(())
    })?;

    GAME_STORAGE.with_borrow_mut(|games| {
        let game = games
            .get_mut(battle_id)
            .ok_or(InvalidAction("battle not found".to_string()))?;
        if game.winners.is_some() {
            return Err(InvalidAction("the game is overed".to_string()));
        }
        if game.initial_state.is_some() {
            return Err(InvalidAction("the game is started".to_string()));
        }
        if game.players.contains(&player) {
            return Err(InvalidAction("player already joined".to_string()));
        }
        // if api::call::msg().cycles() != game.deposit_price + game.service_fee {
        //     return Err(InvalidAction("invalid deposit price".to_string()));
        // }
        OWNER_PROFIT.with_borrow_mut(|profit| {
            *profit += game.service_fee;
        });
        game.players.push(player);
        Ok(())
    })
}

#[cfg_attr(not(feature = "library"), ic_cdk::update)]
fn start_game(battle_id: usize, initial_state: Vec<(u8, u8)>) -> Result<(), ContractError> {
    OWNER.with_borrow(|owner| {
        if *owner != api::caller() {
            return Err(InvalidAction("only owner can start game".to_string()));
        }
        Ok(())
    })?;

    GAME_STORAGE.with_borrow_mut(|games| {
        let game = games
            .get_mut(battle_id)
            .ok_or(InvalidAction("battle not found".to_string()))?;
        if game.initial_state.is_some() {
            return Err(InvalidAction("initial game state is not none".to_string()));
        }
        game.initial_state = Some(initial_state);
        Ok(())
    })
}

#[cfg_attr(not(feature = "library"), ic_cdk::update)]
async fn submit_solution(battle_id: usize, solution: GameSolution, player_contributions: Vec<PlayerContribution>) -> Result<(), ContractError> {
    OWNER.with_borrow(|owner| {
        if *owner != api::caller() {
            return Err(InvalidAction("only owner can submit solution".to_string()));
        }
        Ok(())
    })?;
    
    let verifier = VERIFIER.with_borrow(|v| *v);
    let player_contributions_clone = Arc::new(&player_contributions);
    
    let (initial_state, number_of_player, deposit_price) = GAME_STORAGE.with_borrow_mut(|games| {
        let game = games
            .get_mut(battle_id)
            .ok_or(InvalidAction("battle not found".to_string()))?;

        if game.winners.is_some() {
            return Err(InvalidAction("the game is overed".to_string()));
        }
        for player in player_contributions_clone.iter() {
            if !game.players.contains(&player.player) {
                return Err(InvalidAction(format!("player {} not joined", player.player)));
            }
            if player.percent < 0.0 || player.percent > 1.0 {
                return Err(InvalidAction(format!("invalid percent for player {}", player.player)));
            }
        }
        if game.initial_state.is_none() {
            return Err(InvalidAction("initial game state is none".to_string()));
        }
        Ok((game.initial_state.clone().unwrap(), game.players.len(), game.deposit_price))
    })?;

    match &solution {
        GameSolution::Public(solution) => {
            check_solution(&initial_state, solution)?;
        }
        GameSolution::Private(proof) => {
            let (g,): (Result<(), verifier::error::ContractError>,) = call(
                verifier,
                "verify_proof",
                (proof, VK.with(|vk| vk.borrow().clone())),
            )
            .await
            .map_err(|e| InvalidSolution(e.1))?;
            g.map_err(|e| InvalidSolution(e.to_string()))?;
        }
    };

    let total_prize_pool = (number_of_player as u64) * (deposit_price as u64);
    let mut transferred_token = 0u64;
    for (i, player) in player_contributions.iter().enumerate() {
        let amount = if i == player_contributions.len() - 1 {
            total_prize_pool - transferred_token
        } else {
            ((total_prize_pool as f64) * (player.percent as f64)) as u64
        };

        let transfer_args = ic_ledger_types::TransferArgs {
            memo: Memo(0),
            amount: Tokens::from_e8s(amount),
            fee: Tokens::from_e8s(10_000),
            from_subaccount: None,
            to: AccountIdentifier::new(&player.player, &DEFAULT_SUBACCOUNT),
            created_at_time: None,
        };

        ic_ledger_types::transfer(MAINNET_LEDGER_CANISTER_ID, transfer_args)
            .await
            .map_err(|e| InvalidAction(format!("failed to call ledger: {:?}", e)))?
            .map_err(|e| InvalidAction(format!("ledger transfer error {:?}", e)))?;
        
        transferred_token += amount;
    }
    
    GAME_STORAGE.with_borrow_mut(|games| {
        let game = games
            .get_mut(battle_id)
            .ok_or(InvalidAction("battle not found".to_string()))
            .unwrap();
        
        game.solution = Some(solution);
        game.winners = Some(player_contributions);
    });
    
    Ok(())
}

#[cfg(not(feature = "library"))]
ic_cdk::export_candid!();

#[cfg(test)]
mod tests {
    use crate::error::ContractError;
    use crate::game::{GameSolution, PlayerContribution, SudokuGame};
    use candid::{encode_args, encode_one, Decode, Principal};
    use pocket_ic::{PocketIc, WasmResult};
    use std::str::FromStr;
    use verifier::types::{SP1Proof, SP1ProofWithPublicValues};

    #[test]
    fn test_flow() {
        let owner =
            Principal::from_str("fidzb-hbx5v-h35sd-d4d5l-nmeca-m7aiw-ojdu5-ahngg-tedix-m5adv-jae")
                .unwrap();
        dbg!(owner.to_string());
        let pic = PocketIc::new();
        // Create an empty canister as the anonymous principal and add cycles.
        let verifier_id = pic.create_canister_with_settings(Some(owner), None);
        dbg!(verifier_id.to_string());
        pic.add_cycles(verifier_id, 2000000000000000);
        pic.install_canister(
            verifier_id,
            include_bytes!("../../target/wasm32-unknown-unknown/release/verifier.wasm").to_vec(),
            vec![],
            Some(owner),
        );

        let sudoku_id = pic.create_canister_with_settings(Some(owner), None);
        pic.add_cycles(sudoku_id, 2000000000000000);
        dbg!(sudoku_id.to_string());
        pic.install_canister(
            sudoku_id,
            include_bytes!("../../target/wasm32-unknown-unknown/release/sudoku.wasm").to_vec(),
            encode_args((
                "00948d988662c5a60388fc842b618db417e579430a5983421070d6cac2fe150a",
                verifier_id,
            ))
            .unwrap(),
            Some(owner),
        );

        let player1 = Principal::anonymous();
        dbg!(player1.to_string());

        let res = pic
            .update_call(
                sudoku_id,
                owner,
                "create_new_battle",
                encode_args((1u128, 1u128, player1)).unwrap(),
            )
            .unwrap();

        let battle_id = match res {
            WasmResult::Reply(battle_id) => battle_id,
            _ => panic!("create_new_battle failed"),
        };
        let battle_id = Decode!(&battle_id, Result<usize, ContractError>)
            .unwrap()
            .unwrap();

        match pic
            .update_call(
                sudoku_id,
                owner,
                "join_battle",
                encode_args((battle_id, player1)).unwrap(),
            )
            .unwrap()
        {
            WasmResult::Reply(x) => {
                Decode!(&x, Result<(), ContractError>).unwrap().unwrap();
            }
            WasmResult::Reject(e) => {
                panic!("{}", e);
            }
        }

        match pic
            .update_call(
                sudoku_id,
                owner,
                "start_game",
                encode_args((battle_id, initial_state())).unwrap(),
            )
            .unwrap()
        {
            WasmResult::Reply(x) => {
                Decode!(&x, Result<(), ContractError>).unwrap().unwrap();
            }
            WasmResult::Reject(e) => {
                panic!("{}", e);
            }
        }

        match pic
            .update_call(
                sudoku_id,
                owner,
                "submit_solution",
                encode_args((battle_id, GameSolution::Private(sp1_proof()), vec![PlayerContribution {
                    player: player1,
                    percent: 1.0,
                }])).unwrap(),
            )
            .unwrap()
        {
            WasmResult::Reply(x) => {
                Decode!(&x, Result<(), ContractError>).unwrap().unwrap();
            }
            WasmResult::Reject(e) => {
                panic!("{}", e);
            }
        }

        match pic
            .query_call(
                sudoku_id,
                owner,
                "get_battle_info",
                encode_one(battle_id).unwrap(),
            )
            .unwrap()
        {
            WasmResult::Reply(x) => {
                dbg!(Decode!(&x, Result<SudokuGame, ContractError>)
                    .unwrap()
                    .unwrap());
            }
            WasmResult::Reject(e) => {
                panic!("{}", e);
            }
        }

        println!("oke");
    }

    fn initial_state() -> Vec<(u8, u8)> {
        vec![(0, 8), (1, 7), (7, 9), (14, 8), (17, 1)]
    }

    fn solution() -> Vec<u8> {
        vec![
            1, 4, 5, 6, 2, 3, 4, 5, 9, 2, 3, 6, 7, 2, 3, 6, 1, 7, 9, 4, 5, 8, 1, 2, 5, 8, 4, 3, 9,
            6, 7, 7, 6, 4, 9, 1, 5, 3, 8, 2, 3, 9, 8, 6, 2, 7, 5, 1, 4, 5, 8, 2, 3, 6, 1, 7, 4, 9,
            6, 1, 3, 7, 9, 4, 8, 2, 5, 9, 4, 7, 5, 8, 2, 1, 3, 6,
        ]
    }

    fn sp1_proof() -> SP1ProofWithPublicValues {
        let proof = "0906909026e37a4e9ddc3661628409a431dd4e08a77c804bac6c0e4e54769d555cea30c82a5aabf3caed31edb13d06031ca37976e916c548f6872a71f4c42f272867923f0a87eacfe79dfd2aa0c64a48ecd3ff5ff8b6f4398ee63322f23eda4af00b10d22e209f7b0e73f200966dc71e0f0623cceddf02aa89882c66940d779dbd56b9d20ce52f4513a68dcf43ad637ad38569c0b0f35f9ecda642055e39c078ed4956c817995310d7bccf997c0282e67c9a6a24f209522ffc185d34a0bec64b57624955289df886c2cd374613679aecf62ed0220656e9ceb8fdb11a2884b411e4107c211ab737dc2bebef54f18ecda680cbf051a25aeb0a9672b10fffac47490facae01".to_string();
        let public_values = "05000000000000000008010707090e081101".to_string();
        SP1ProofWithPublicValues {
            proof: SP1Proof::Groth16(proof),
            public_values,
        }
    }
}
