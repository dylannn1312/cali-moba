use crate::error::ContractError;
use crate::error::ContractError::{InvalidAction, InvalidSolution};
use crate::game::{GameSolution, SudokuGame};
use crate::logic::check_solution;
use crate::state::{GlobalState, GAME_STORAGE, OWNER, OWNER_PROFIT, VERIFIER, VK};
use candid::Principal;
use ic_cdk::{api, call};

#[cfg_attr(not(feature = "library"), ic_cdk::init)]
fn instantiate(vk: String, verifier_address: Principal) {
    VK.set(vk);
    OWNER.set(api::caller());
    VERIFIER.set(verifier_address);
}

#[cfg_attr(not(feature = "library"), ic_cdk::query)]
fn get_room_info(id: usize) -> Result<SudokuGame, ContractError> {
    GAME_STORAGE.with(|games| {
        let games = games.borrow();
        if id >= games.len() {
            return Err(InvalidAction("room not found".to_string()));
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
fn create_new_room(
    deposit_price: u128,
    service_fee: u128,
    creator: Principal,
) -> Result<usize, ContractError> {
    OWNER.with_borrow(|owner| {
        if *owner != api::caller() {
            return Err(InvalidAction("only owner can create a room".to_string()));
        }
        Ok(())
    })?;

    GAME_STORAGE.with_borrow_mut(|game| {
        let new_room_id = game.len();
        game.push(SudokuGame {
            initial_state: None,
            creator,
            deposit_price,
            service_fee,
            players: vec![],
            solution: None,
            winner: None,
            claimed: false,
        });
        Ok(new_room_id)
    })
}

#[cfg_attr(not(feature = "library"), ic_cdk::update)]
fn join_room(room_id: usize, player: Principal) -> Result<(), ContractError> {
    OWNER.with_borrow(|owner| {
        if *owner != api::caller() {
            return Err(InvalidAction("only owner can add player".to_string()));
        }
        Ok(())
    })?;

    GAME_STORAGE.with_borrow_mut(|games| {
        let game = games
            .get_mut(room_id)
            .ok_or(InvalidAction("room not found".to_string()))?;
        if game.winner.is_some() {
            return Err(InvalidAction("the game is overed".to_string()));
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
fn start_game(room_id: usize, initial_state: Vec<(u8, u8)>) -> Result<(), ContractError> {
    OWNER.with_borrow(|owner| {
        if *owner != api::caller() {
            return Err(InvalidAction("only owner can start game".to_string()));
        }
        Ok(())
    })?;

    GAME_STORAGE.with_borrow_mut(|games| {
        let game = games
            .get_mut(room_id)
            .ok_or(InvalidAction("room not found".to_string()))?;
        if game.initial_state.is_some() {
            return Err(InvalidAction("initial game state is not none".to_string()));
        }
        game.initial_state = Some(initial_state);
        Ok(())
    })
}

#[cfg_attr(not(feature = "library"), ic_cdk::update)]
async fn submit_solution(room_id: usize, solution: GameSolution) -> Result<(), ContractError> {
    let verifier = VERIFIER.with_borrow(|v| *v);
    let initial_state = GAME_STORAGE.with_borrow_mut(|games| {
        let game = games
            .get_mut(room_id)
            .ok_or(InvalidAction("room not found".to_string()))?;
        let sender = api::caller();

        if game.winner.is_some() {
            return Err(InvalidAction("the game is overed".to_string()));
        }
        if !game.players.contains(&sender) {
            return Err(InvalidAction(
                "the player has not yet participated".to_string(),
            ));
        }
        if game.initial_state.is_none() {
            return Err(InvalidAction("initial game state is none".to_string()));
        }
        Ok(game.initial_state.clone().unwrap())
    })?;

    match &solution {
        GameSolution::Public(solution) => {
            check_solution(&initial_state, solution)?;
        }
        GameSolution::Private(proof) => {
            let (g, ): (Result<(), verifier::error::ContractError>,) = call(
                verifier,
                "verify_proof",
                (proof, VK.with(|vk| vk.borrow().clone())),
            )
            .await
            .map_err(|e| InvalidSolution(e.1))?;
            g.map_err(|e| InvalidSolution(e.to_string()))?;
        }
    };

    GAME_STORAGE.with_borrow_mut(|games| {
        let game = games
            .get_mut(room_id)
            .ok_or(InvalidAction("room not found".to_string()))
            .unwrap();
        game.solution = Some(solution);
        game.winner = Some(api::caller());
    });
    Ok(())
}

ic_cdk::export_candid!();

#[cfg(test)]
mod tests {
    use crate::error::ContractError;
    use crate::game::{GameSolution, SudokuGame};
    use candid::{decode_args, decode_one, encode_args, encode_one, Decode, Principal};
    use pocket_ic::{PocketIc, UserError, WasmResult};
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
                "create_new_room",
                encode_args((1u128, 1u128, player1)).unwrap(),
            )
            .unwrap();

        let room_id = match res {
            WasmResult::Reply(room_id) => room_id,
            _ => panic!("create_new_room failed"),
        };
        let room_id = Decode!(&room_id, Result<usize, ContractError>)
            .unwrap()
            .unwrap();

        match pic
            .update_call(
                sudoku_id,
                owner,
                "join_room",
                encode_args((room_id, player1)).unwrap(),
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
                encode_args((room_id, initial_state())).unwrap(),
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
                player1,
                "submit_solution",
                encode_args((room_id, GameSolution::Private(sp1_proof()))).unwrap(),
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
                "get_room_info",
                encode_one(room_id).unwrap(),
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
