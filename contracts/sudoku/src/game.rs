use candid::{CandidType, Principal};
use serde::{Deserialize, Serialize};
use verifier::types::SP1ProofWithPublicValues;

#[derive(Serialize, Deserialize, CandidType, Clone, Debug)]
pub struct SudokuGame {
    pub initial_state: Option<Vec<(u8, u8)>>,
    pub creator: Principal,
    pub deposit_price: u128,
    pub service_fee: u128,
    pub players: Vec<Principal>,
    pub solution: Option<GameSolution>,
    pub winners: Option<Vec<PlayerContribution>>,
    pub claimed: bool
}

#[derive(Serialize, Deserialize, CandidType, Clone, Debug)]
pub enum GameSolution {
    Public(Vec<u8>),
    Private(SP1ProofWithPublicValues)
}

#[derive(Serialize, Deserialize, CandidType, Clone, Debug)]
pub struct PlayerContribution {
    pub player: Principal,
    pub percent: f32,
}