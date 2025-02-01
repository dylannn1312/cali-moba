use dotenv::dotenv;
use tokio::sync::OnceCell;

#[allow(non_snake_case)]
pub struct Env {
    pub SERVER_HOST: String,
    pub SERVER_PORT: u32,
    pub GAME_CONTRACT: String,
    pub GAME_OWNER_PEM_FILE: String,
    pub RPC_URL: String,
    pub SERVICE_FEE: u128,
    pub APPLICATION_ID: String,
}

static ENV: OnceCell<Env> = OnceCell::const_new();

fn read_env(key: &'static str) -> String {
    std::env::var(key).expect(&format!("{} must be set", key))
}

pub async fn config_env() {
    dotenv().ok();
    ENV.get_or_init(|| async {
        Env {
            SERVER_HOST: read_env("SERVER_HOST"),
            SERVER_PORT: read_env("SERVER_PORT").parse().unwrap(),
            GAME_CONTRACT: read_env("GAME_CONTRACT"),
            GAME_OWNER_PEM_FILE: read_env("GAME_OWNER_PEM_FILE"),
            RPC_URL: read_env("RPC_URL"),
            SERVICE_FEE: read_env("SERVICE_FEE").parse().unwrap(),
            APPLICATION_ID: read_env("APPLICATION_ID"),
        }
    }).await;
}

pub fn env() -> &'static Env {
    ENV.get().unwrap()
}