use axum::{
    routing::post,
    Router,
};
use axum::routing::get;
use crate::api::v1::controllers::games::battle::battle_info::get_battle_info;
use crate::api::v1::controllers::games::battle::create_new_battle;
use crate::api::v1::controllers::games::battle::join_battle::join_battle;

pub fn router() -> Router {
    Router::new().nest(
        "/battle",
        Router::new()
            .merge(Router::new().route("/", post(create_new_battle)))
            .merge(Router::new().route("/join", post(join_battle)))
            .merge(Router::new().route("/info/{id}", get(get_battle_info)))
    )
}