use axum::{
    routing::post,
    Router,
};
use crate::api::v1::controllers::games::battle::create_new_battle;
use crate::api::v1::controllers::games::battle::join_battle::join_battle;

pub fn router() -> Router {
    Router::new().nest(
        "/battle",
        Router::new()
            .merge(Router::new().route("", post(create_new_battle)))
            .merge(Router::new().route("/join", post(join_battle)))
    )
}