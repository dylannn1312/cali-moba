use crate::api::v1::routes::all_routes::get_all_routes;
use crate::config::config_app;
use crate::config::env_config::env;

pub mod games;
pub mod api;
pub mod config;

#[tokio::main]
async fn main() {
    config_app().await;
    let app = get_all_routes();
    let listener =
        tokio::net::TcpListener::bind(format!("{}:{}", env().SERVER_HOST, env().SERVER_PORT))
            .await
            .unwrap();

    axum::serve(listener, app).await.unwrap();
}