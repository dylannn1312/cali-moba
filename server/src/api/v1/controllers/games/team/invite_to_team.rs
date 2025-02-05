use crate::api::v1::errors::AppError;
use crate::api::v1::utils::calimero_cli::run_calimero_cmd;
use axum::Json;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct InviteToTeamReq {
    node_public_key: String,
    context_id: String,
    context_identity: String,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct InviteToTeamRes {
    invitation_payload: String,
}

pub async fn invite_to_team(
    Json(InviteToTeamReq {
        node_public_key,
        context_id,
        context_identity,
    }): Json<InviteToTeamReq>,
) -> Result<Json<InviteToTeamRes>, AppError> {
    let res = run_calimero_cmd(
        "admin",
        &format!("context invite {context_id} {context_identity} {node_public_key}",),
    )
    .await?;
    let invitation_payload = res.get("data").unwrap().as_str().unwrap().to_string();

    Ok(Json(InviteToTeamRes { invitation_payload }))
}
