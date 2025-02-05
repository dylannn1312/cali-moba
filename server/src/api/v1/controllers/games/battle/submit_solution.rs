use crate::api::v1::errors::AppError;
use crate::api::v1::utils::ic_caller::SudokuContract;
use crate::config::env_config::env;
use crate::games::sudoku::SudokuGame;
use crate::games::Game;
use axum::Json;
use serde::{Deserialize, Serialize};
use sudoku::game::{GameSolution, PlayerContribution};
use verifier::types::SP1Proof;

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SubmitSolutionReq {
    battle_id: usize,
    solution: Vec<u8>,
    public: bool,
    player_contributions: Vec<PlayerContribution>,
}

pub async fn submit_battle_solution(
    Json(SubmitSolutionReq {
        battle_id,
        solution,
        public,
        player_contributions,
    }): Json<SubmitSolutionReq>,
) -> Result<Json<()>, AppError> {
    let env = env();
    let agent = SudokuContract::agent_from_env(env).await?;
    let sudoku_contract = SudokuContract::from_env(env, &agent)?;

    if public {
        sudoku_contract
            .submit_solution(
                battle_id,
                GameSolution::Public(solution),
                player_contributions,
            )
            .await?;
    } else {
        let initial_state = sudoku_contract
            .get_battle_info(battle_id)
            .await?
            .initial_state
            .unwrap();

        let game = SudokuGame {
            initial_state,
            solution,
        };
        let proof = game.generate_proof().await?;
        sudoku_contract
            .submit_solution(
                battle_id,
                GameSolution::Private(verifier::types::SP1ProofWithPublicValues {
                    proof: SP1Proof::Groth16(hex::encode(proof.bytes())),
                    public_values: hex::encode(proof.public_values.to_vec()),
                }),
                player_contributions,
            )
            .await?;
    }
    Ok(Json(()))
}

#[cfg(test)]
mod tests {
    use crate::api::v1::controllers::games::battle::submit_solution::SubmitSolutionReq;

    #[test]
    fn test() {
        let g = r#"{"battleId":8,"solution":[1,4,5,6,2,3,4,5,9,2,3,6,7,2,3,6,1,7,9,4,5,8,1,2,5,8,4,3,9,6,7,7,6,4,9,1,5,3,8,2,3,9,8,6,2,7,5,1,4,5,8,2,3,6,1,7,4,9,6,1,3,7,9,4,8,2,5,9,4,7,5,8,2,1,3,6],"public":false,"playerContributions":[]}"#;
        let parsed = serde_json::from_str::<SubmitSolutionReq>(g).unwrap();
        dbg!(parsed);
    }
}
