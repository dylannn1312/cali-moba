use crate::api::v1::utils::ic_caller::IcCaller;
use std::sync::Arc;

#[derive(Clone)]
pub struct AppState<'a> {
    pub sudoku_caller: Arc<IcCaller<'a>>,
}

impl<'a> AppState<'a> {
    // pub fn from_env(config: &Env) -> anyhow::Result<Self> {
    //     let ic_agent = IcCaller::<'a>::gen_agent(&config.GAME_OWNER_PEM_FILE, &config.RPC_URL)?;
    //     Ok(Self {
    //         sudoku_caller: Arc::new(IcCaller::new(
    //             &config.GAME_CONTRACT,
    //             &ic_agent,
    //         )?),
    //     })
    // }
}
