use axum::{
    routing::post,
    Router,
};
use crate::api::v1::controllers::games::team::create_new_team;
use crate::api::v1::controllers::games::team::invite_to_team::invite_to_team;

pub fn router() -> Router {
    Router::new().nest(
        "/team",
        Router::new()
            .merge(Router::new().route("/", post(create_new_team)))
            .merge(Router::new().route("/invite", post(invite_to_team)))
    )
}