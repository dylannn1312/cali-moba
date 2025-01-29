use candid::{CandidType, Deserialize};

#[derive(thiserror::Error, Debug, CandidType, Deserialize)]
pub enum ContractError {
    #[error("Unknown error: {0}")]
    Unknown(String),
    
    #[error("Parse hex error: {0}")]
    ParseHex(String),

    #[error("{0} is not in base field")]
    NotInBaseField(String),

    #[error("{0} is not in scalar field")]
    NotInScalarField(String),

    #[error("Proof is invalid: {0}")]
    InvalidProof(String),

    #[error("Point is not on curve")]
    PointNotOnCurve,

    #[error("Pairing failed")]
    PairingFailed,
}
