use crate::api::v1::errors::AppError;
use crate::api::v1::utils::ic_caller::SudokuContract;
use crate::config::env_config::env;
use axum::Json;
use ic_agent::export::Principal;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct JoinBattleReq {
    battle_id: usize,
    player: Principal,
}

pub async fn join_battle(Json(game): Json<JoinBattleReq>) -> Result<Json<()>, AppError> {
    let env = env();
    let agent = SudokuContract::agent_from_env(env).await?;
    let sudoku_contract = SudokuContract::from_env(env, &agent)?;
    sudoku_contract.join_battle(game.battle_id, game.player).await?;
    Ok(Json(()))
}

#[cfg(test)]
mod tests {
    use crate::api::v1::controllers::games::battle::join_battle::{join_battle, JoinBattleReq};
    use crate::config::config_app;
    use axum::Json;
    use ic_agent::export::Principal;
    use std::str::FromStr;

    #[tokio::test]
    async fn test_start_game() {
        config_app().await;
        let res = join_battle(Json(JoinBattleReq {
            battle_id: 4,
            player: Principal::from_str(
                "pnklf-ojyec-2l2al-nuxfq-3vss6-udii2-2txam-wusja-usc54-n5uos-gae",
            )
            .unwrap(),
        }))
        .await
        .unwrap();
        dbg!(res.0);
    }
}
