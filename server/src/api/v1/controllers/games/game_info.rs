use crate::api::v1::errors::AppError;
use crate::config::env_config::env;
use axum::Json;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct GameInfoRes {
    pub game_contract: String,
    pub service_fee: u128,
    pub application_id: String,
}

pub async fn get_game_info() -> Result<Json<GameInfoRes>, AppError> {
    let env = env();
    Ok(Json(GameInfoRes {
        game_contract: env.GAME_CONTRACT.clone(),
        service_fee: env.SERVICE_FEE,
        application_id: env.APPLICATION_ID.clone(),
    }))
}