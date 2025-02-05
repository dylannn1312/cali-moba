pub mod join_battle;
pub mod battle_info;
pub mod submit_solution;

use crate::api::v1::errors::AppError;
use crate::api::v1::utils::ic_caller::SudokuContract;
use crate::config::env_config::env;
use axum::Json;
use ic_agent::export::Principal;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateNewBattleReq {
    deposit_price: u128,
    creator: Principal,
}

pub async fn create_new_battle(
    Json(battle_info): Json<CreateNewBattleReq>,
) -> Result<Json<usize>, AppError> {
    let env = env();
    let agent = SudokuContract::agent_from_env(env).await?;
    let sudoku_contract = SudokuContract::from_env(env, &agent)?;
    let battle_id = sudoku_contract.create_new_battle(battle_info.deposit_price, env.SERVICE_FEE, battle_info.creator).await?;
    Ok(Json(battle_id))
}

#[cfg(test)]
mod tests {
    use std::str::FromStr;
    use crate::config::config_app;
    use axum::Json;
    use ic_agent::export::Principal;
    use crate::api::v1::controllers::games::battle::{create_new_battle, CreateNewBattleReq};

    #[tokio::test]
    async fn test_create_new_battle() {
        config_app().await;
        let res = create_new_battle(Json(CreateNewBattleReq {
            deposit_price: 1,
            creator: Principal::from_str("pnklf-ojyec-2l2al-nuxfq-3vss6-udii2-2txam-wusja-usc54-n5uos-gae").unwrap(),
        }))
            .await
            .unwrap();
        dbg!(res.0);
    }
}
