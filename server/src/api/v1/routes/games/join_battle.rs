use axum::{routing::post, Router};
use crate::api::v1::controllers::games::join_battle::join_battle;

pub fn router() -> Router {
    Router::new().route("/join-battle", post(join_battle))
}
