use ark_bn254::{Fq, Fr};
use candid::CandidType;
use num_bigint::BigUint;
use serde::{Deserialize, Serialize};

pub type BaseField = Fq;
pub type ScalarField = Fr;

#[derive(Serialize, Deserialize, CandidType)]
pub struct SP1ProofWithPublicValues {
    pub proof: SP1Proof,
    pub public_values: String,
}

#[derive(Serialize, Deserialize, CandidType)]
pub enum SP1Proof {
    #[serde(rename = "groth16")]
    Groth16(String)
}

#[derive(Serialize, Deserialize)]
pub struct ProofConsts {
    pub r: BigUint,
    pub q: BigUint,
    pub alpha_x: BigUint,
    pub alpha_y: BigUint,
    pub beta_x_0: BigUint,
    pub beta_x_1: BigUint,
    pub beta_y_0: BigUint,
    pub beta_y_1: BigUint,
    pub gamma_x_0: BigUint,
    pub gamma_x_1: BigUint,
    pub gamma_y_0: BigUint,
    pub gamma_y_1: BigUint,
    pub delta_x_0: BigUint,
    pub delta_x_1: BigUint,
    pub delta_y_0: BigUint,
    pub delta_y_1: BigUint,
    pub ic_x: [BigUint; 3],
    pub ic_y: [BigUint; 3],
}