use crate::api::v1::errors::AppError;
use crate::api::v1::utils::ic_caller::SudokuContract;
use crate::config::env_config::env;
use axum::Json;
use ic_agent::export::Principal;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateNewRoomReq {
    deposit_price: u128,
    creator: Principal,
}

pub async fn create_new_room(
    Json(room_info): Json<CreateNewRoomReq>,
) -> Result<Json<usize>, AppError> {
    let env = env();
    let agent = SudokuContract::agent_from_env(env).await?;
    let sudoku_contract = SudokuContract::from_env(env, &agent)?;
    let room_id = sudoku_contract.create_new_room(room_info.deposit_price, env.SERVICE_FEE, room_info.creator).await?;
    Ok(Json(room_id))
}

#[cfg(test)]
mod tests {
    use std::str::FromStr;
    use crate::api::v1::controllers::games::new_room::{create_new_room, CreateNewRoomReq};
    use crate::config::config_app;
    use axum::Json;
    use ic_agent::export::Principal;

    #[tokio::test]
    async fn test_create_new_room() {
        config_app().await;
        let res = create_new_room(Json(CreateNewRoomReq {
            deposit_price: 1,
            creator: Principal::from_str("pnklf-ojyec-2l2al-nuxfq-3vss6-udii2-2txam-wusja-usc54-n5uos-gae").unwrap(),
        }))
        .await
        .unwrap();
        dbg!(res.0);
    }
}
