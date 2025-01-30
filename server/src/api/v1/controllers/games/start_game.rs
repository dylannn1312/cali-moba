use crate::api::v1::errors::AppError;
use axum::Json;
use serde::{Deserialize, Serialize};
use crate::api::v1::utils::ic_caller::SudokuContract;
use crate::config::env_config::env;

#[derive(Serialize, Deserialize, Debug)]
pub struct StartGameReq {
    room_id: usize,
    initial_state: Vec<(u8, u8)>,
}

pub async fn start_game(Json(game): Json<StartGameReq>) -> Result<Json<()>, AppError> {
    let env = env();
    let agent = SudokuContract::agent_from_env(env).await?;
    let sudoku_contract = SudokuContract::from_env(env, &agent)?;
    sudoku_contract.start_game(game.room_id, game.initial_state).await?;
    Ok(Json(()))
}

#[cfg(test)]
mod tests {
    use crate::api::v1::controllers::games::start_game::{start_game, StartGameReq};
    use crate::config::config_app;
    use axum::Json;

    #[tokio::test]
    async fn test_start_game() {
        config_app().await;
        let res = start_game(Json(StartGameReq {
            room_id: 4,
            initial_state: initial_state(),
        }))
            .await
            .unwrap();
        dbg!(res.0);
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
}