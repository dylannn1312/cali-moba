use axum::Router;

pub mod generate_proof;
pub mod new_room;
pub mod service_fee;
pub mod start_game;
pub mod join_room;

pub fn router() -> Router {
    Router::new().nest(
        "/games",
        Router::new()
            .merge(new_room::router())
            .merge(generate_proof::router())
            .merge(service_fee::router())
            .merge(start_game::router())
            .merge(join_room::router()),
    )
}
