use axum::extract::Path;
use crate::api::v1::errors::AppError;
use crate::api::v1::utils::ic_caller::SudokuContract;
use crate::config::env_config::env;
use axum::Json;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct BattleInfoRes(sudoku::game::SudokuGame);

pub async fn get_battle_info(
    Path(id): Path<usize>,
) -> Result<Json<BattleInfoRes>, AppError> {
    let env = env();
    let agent = SudokuContract::agent_from_env(env).await?;
    let sudoku_contract = SudokuContract::from_env(env, &agent)?;
    let res = sudoku_contract.get_battle_info(id).await?;
    Ok(Json(BattleInfoRes(res)))
}
