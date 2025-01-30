use axum::{routing::post, Router};
use crate::api::v1::controllers::games::join_room::join_room;

pub fn router() -> Router {
    Router::new().route("/join-room", post(join_room))
}
