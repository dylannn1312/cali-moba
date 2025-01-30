use crate::api::v1::errors::AppError;
use crate::games::sudoku::SudokuGame;
use crate::games::Game;
use axum::Json;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct GenerateProofReq {
    initial_state: Vec<(u8, u8)>,
    solution: Vec<u8>
}

#[derive(Debug, Serialize, Deserialize)]
pub struct GenerateProofRes {
    proof_bytes: String,
    public_input_bytes: String
}

pub async fn generate_proof(
    Json(game): Json<GenerateProofReq>,
) -> Result<Json<GenerateProofRes>, AppError> {
    let game = SudokuGame {
        initial_state: game.initial_state,
        solution: game.solution
    };
    let proof = game.generate_proof().await?;
    Ok(Json(GenerateProofRes {
        proof_bytes: hex::encode(proof.bytes()),
        public_input_bytes: hex::encode(proof.public_values.to_vec()),
    }))
}

#[cfg(test)]
mod tests {
    use crate::api::v1::controllers::games::generate_proof::{generate_proof, GenerateProofReq};
    use crate::config::config_app;
    use axum::Json;

    #[tokio::test]
    async fn test_generate_proof() {
        config_app().await;
        let res = generate_proof(Json(GenerateProofReq {
            initial_state: vec![],
            solution: vec![],
        })).await.unwrap();
        dbg!(res.0);
    }
}
