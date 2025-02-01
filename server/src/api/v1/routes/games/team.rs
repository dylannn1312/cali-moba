use crate::api::v1::controllers::games::team::new::create_new_team;
use axum::{
    routing::post,
    Router,
};

pub fn router() -> Router {
    Router::new().nest(
        "/team",
        Router::new()
            .merge(Router::new().route("/new", post(create_new_team)))
    )
}