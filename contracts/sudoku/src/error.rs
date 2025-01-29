use candid::{CandidType, Deserialize};
use thiserror::Error;

#[derive(Error, Debug, CandidType, Deserialize)]
pub enum ContractError {    
    #[error("Invalid proof: {0}")]
    InvalidProof(String),

    #[error("Invalid solution: {0}")]
    InvalidSolution(String),
    
    #[error("Invalid action: {0}")]
    InvalidAction(String),
}
