use crate::config::env_config::Env;
use anyhow::anyhow;
use ic_agent::agent::AgentBuilder;
use ic_agent::export::Principal;
use ic_agent::identity::Secp256k1Identity;
use ic_agent::Agent;
use ic_utils::canister::CanisterBuilder;
use ic_utils::Canister;

#[derive(Debug, Clone)]
pub struct IcCaller<'a> {
    pub(crate) canister: Canister<'a>,
}

impl<'a> IcCaller<'a> {
    pub async fn gen_agent(pem_path: &str, replica_url: &str) -> anyhow::Result<Agent> {
        let identity = Secp256k1Identity::from_pem_file(pem_path)?;
        let agent = AgentBuilder::default()
            .with_identity(identity)
            .with_url(replica_url)
            .build()?;
        agent.fetch_root_key().await?;
        Ok(agent)
    }

    pub fn new(canister_id: &str, agent: &'a Agent) -> anyhow::Result<Self> {
        let canister = CanisterBuilder::new()
            .with_canister_id(canister_id)
            .with_agent(agent)
            .build()?;
        Ok(Self { canister })
    }
}

pub struct SudokuContract<'a>(IcCaller<'a>);

impl<'a> SudokuContract<'a> {
    pub async fn agent_from_env(env: &Env) -> anyhow::Result<Agent> {
        let agent = IcCaller::gen_agent(&env.GAME_OWNER_PEM_FILE, &env.RPC_URL).await?;
        Ok(agent)
    }
    pub fn from_env(env: &Env, agent: &'a Agent) -> anyhow::Result<Self> {
        let ic_caller = IcCaller::new(&env.GAME_CONTRACT, agent)?;
        Ok(Self(ic_caller))
    }

    pub async fn create_new_room(
        &self,
        deposit_price: u128,
        service_fee: u128,
        creator: Principal,
    ) -> anyhow::Result<usize> {
        let request = self
            .0
            .canister
            .update("create_new_room")
            .with_args((deposit_price, service_fee, creator))
            .build::<(Result<usize, sudoku::error::ContractError>,)>();
        let room_id = request
            .call_and_wait()
            .await?
            .0
            .map_err(|e| anyhow!("Fail to create new room: {:?}", e))?;
        Ok(room_id)
    }

    pub async fn join_room(
        &self,
        room_id: usize,
        player: Principal,
    ) -> anyhow::Result<()> {
        let request = self
            .0
            .canister
            .update("join_room")
            .with_args((room_id, player))
            .build::<(Result<(), sudoku::error::ContractError>,)>();
        request
            .call_and_wait()
            .await?
            .0
            .map_err(|e| anyhow!("Fail to join room : {:?}", e))?;
        Ok(())
    }

    pub async fn start_game(
        &self,
        room_id: usize,
        initial_state: Vec<(u8, u8)>,
    ) -> anyhow::Result<()> {
        let request = self
            .0
            .canister
            .update("start_game")
            .with_args((room_id, initial_state))
            .build::<(Result<(), sudoku::error::ContractError>,)>();
        request
            .call_and_wait()
            .await?
            .0
            .map_err(|e| anyhow!("Fail to start game: {:?}", e))?;
        Ok(())
    }
}
