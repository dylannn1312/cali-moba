use crate::api::v1::errors::AppError;
use crate::api::v1::utils::calimero_cli::run_calimero_cmd;
use crate::config::env_config::env;
use axum::Json;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateTeamReq {
    node_name: String
}

pub async fn create_new_team(
    Json(creator): Json<CreateTeamReq>,
) -> Result<Json<String>, AppError> {
    let res = run_calimero_cmd(
        "admin",
        &format!(
            "context create --application-id {} --protocol near",
            env().APPLICATION_ID
        ),
    )
    .await?;
    let context_id = res.get("data").unwrap().get("contextId").unwrap().as_str().unwrap();
    let context_identity = res.get("data").unwrap().get("memberPublicKey").unwrap().as_str().unwrap();

    let res = run_calimero_cmd(&creator.node_name, "identity generate").await?;
    let node_public_key = res.get("data").unwrap().get("publicKey").unwrap().as_str().unwrap();
    let node_private_key = res.get("data").unwrap().get("privateKey").unwrap().as_str().unwrap();
    
    let res = run_calimero_cmd(
        "admin",
        &format!(
            "context invite {context_id} {context_identity} {node_public_key}",
        ),
    ).await?;
    let invitation_payload = res.get("data").unwrap().as_str().unwrap();

    let res = run_calimero_cmd(&creator.node_name, &format!("context join {node_private_key} {invitation_payload}")).await?;
    let context_id_2 = res.get("data").unwrap().get("contextId").unwrap().as_str().unwrap();
    
    if context_id != context_id_2 {
        return Err(AppError::Unknown(anyhow::anyhow!("context_id not match")));
    }
    
    Ok(Json(context_id.to_string()))
}

#[cfg(test)]
mod tests {
    use axum::Json;
    use crate::api::v1::controllers::games::team::new::{create_new_team, CreateTeamReq};
    use crate::config::config_app;

    #[tokio::test]
    async fn test_create_new_team() {
        config_app().await;
        let res = create_new_team(Json(CreateTeamReq {
            node_name: "node1".to_string(),
        })).await.unwrap();
        dbg!(&res.0);
    }
}
