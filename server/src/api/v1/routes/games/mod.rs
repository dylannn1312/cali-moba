use axum::Router;
use axum::routing::get;
use crate::api::v1::controllers::games::game_info::get_game_info;

pub mod generate_proof;
pub mod start_game;
pub mod team;
pub mod battle;

pub fn router() -> Router {
    Router::new().nest(
        "/games",
        Router::new()
            .merge(Router::new().route("/info", get(get_game_info)))
            .merge(battle::router())
            .merge(generate_proof::router())
            .merge(start_game::router())
            .merge(team::router()),
    )
}
