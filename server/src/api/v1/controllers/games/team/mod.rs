use crate::api::v1::errors::AppError;
use crate::api::v1::utils::calimero_cli::run_calimero_cmd;
use crate::config::env_config::env;
use axum::Json;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateTeamReq {
    node_public_key: String,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateTeamRes {
    invitation_payload: String,
    context_id: String,
}

pub async fn create_new_team(
    Json(CreateTeamReq { node_public_key }): Json<CreateTeamReq>,
) -> Result<Json<CreateTeamRes>, AppError> {
    let res = run_calimero_cmd(
        "admin",
        &format!(
            "context create --application-id {} --protocol near",
            env().APPLICATION_ID
        ),
    )
    .await?;
    let context_id = res
        .get("data")
        .unwrap()
        .get("contextId")
        .unwrap()
        .as_str()
        .unwrap()
        .to_string();
    let context_identity = res
        .get("data")
        .unwrap()
        .get("memberPublicKey")
        .unwrap()
        .as_str()
        .unwrap();

    let res = run_calimero_cmd(
        "admin",
        &format!("context invite {context_id} {context_identity} {node_public_key}",),
    )
    .await?;
    let invitation_payload = res.get("data").unwrap().as_str().unwrap().to_string();

    Ok(Json(CreateTeamRes {
        invitation_payload,
        context_id,
    }))
}

#[cfg(test)]
mod tests {
    use crate::config::config_app;
    use axum::Json;
    use crate::api::v1::controllers::games::team::{create_new_team, CreateTeamReq};

    #[tokio::test]
    async fn test_create_new_team() {
        config_app().await;
        let res = create_new_team(Json(CreateTeamReq {
            node_public_key: "".to_string(),
        }))
        .await
        .unwrap();
        dbg!(&res.0);
    }
}
