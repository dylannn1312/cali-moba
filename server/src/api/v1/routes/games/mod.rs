use axum::Router;

pub mod generate_proof;
pub mod new_battle;
pub mod service_fee;
pub mod start_game;
pub mod join_battle;
pub mod team;

pub fn router() -> Router {
    Router::new().nest(
        "/games",
        Router::new()
            .merge(new_battle::router())
            .merge(generate_proof::router())
            .merge(service_fee::router())
            .merge(start_game::router())
            .merge(join_battle::router())
            .merge(team::router()),
    )
}
