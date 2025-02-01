use crate::api::v1::controllers::games::new_battle::create_new_battle;
use axum::{
    routing::post,
    Router,
};

pub fn router() -> Router {
    Router::new().route("/new-battle", post(create_new_battle))
}