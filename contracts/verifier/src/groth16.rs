use crate::bn254::my_fq12::MyFq12;
use crate::bn254::pairing::pairing;
use crate::error::ContractError;
use crate::error::ContractError::PairingFailed;
use crate::types::{BaseField, ProofConsts, ScalarField};
use ark_bn254::{Fq12, Fq2, G1Affine, G2Affine};
use num_bigint::BigUint;
use num_traits::One;
use std::panic;
use std::str::FromStr;

pub fn u256_to_base_field(x: &BigUint) -> BaseField {
    BaseField::from_str(&x.to_string()).unwrap()
}

pub fn u256_to_scalar_field(x: &BigUint) -> ScalarField {
    ScalarField::from_str(&x.to_string()).unwrap()
}

pub fn g1_from_xy(x: &BigUint, y: &BigUint) -> Result<G1Affine, ContractError> {
    panic::catch_unwind(|| G1Affine::new(u256_to_base_field(x), u256_to_base_field(y)))
        .map_err(|_e| ContractError::PointNotOnCurve)
}

pub fn g2_from_xy(
    x_real: &BigUint,
    x_img: &BigUint,
    y_real: &BigUint,
    y_img: &BigUint,
) -> Result<G2Affine, ContractError> {
    let result = panic::catch_unwind(|| {
        G2Affine::new(
            Fq2 {
                c0: u256_to_base_field(x_real),
                c1: u256_to_base_field(x_img),
            },
            Fq2 {
                c0: u256_to_base_field(y_real),
                c1: u256_to_base_field(y_img),
            },
        )
    });
    result.map_err(|_e| ContractError::PointNotOnCurve)
}

pub fn verify_groth16_proof(
    proof: &[BigUint; 8],
    inputs: &[BigUint; 2],
    proof_consts: &ProofConsts,
) -> Result<(), ContractError> {
    let ProofConsts {
        r: _r,
        q,
        alpha_x,
        alpha_y,
        beta_x_0,
        beta_x_1,
        beta_y_0,
        beta_y_1,
        gamma_x_0,
        gamma_x_1,
        gamma_y_0,
        gamma_y_1,
        delta_x_0,
        delta_x_1,
        delta_y_0,
        delta_y_1,
        ic_x,
        ic_y,
    } = proof_consts;

    // Validate that all evaluations ∈ F
    for x in inputs {
        if x >= q {
            return Err(ContractError::NotInBaseField(x.to_string()));
        }
    }

    // Check pairing
    // Compute the linear combination vk_x
    let mut vk_x = g1_from_xy(&ic_x[0], &ic_y[0])?;
    for i in 1..ic_x.len() {
        let tmp = g1_from_xy(&ic_x[i], &ic_y[i])?;
        vk_x = G1Affine::from(vk_x + tmp * u256_to_scalar_field(&inputs[i - 1]));
    }

    // compute
    let a = g1_from_xy(&proof[0], &proof[1])?; // pi_a
    let b = g2_from_xy(&proof[3], &proof[2], &proof[5], &proof[4])?; // pi_b

    let alpha = g1_from_xy(alpha_x, alpha_y)?;
    let beta = g2_from_xy(beta_x_1, beta_x_0, beta_y_1, beta_y_0)?;
    let gamma_neg = g2_from_xy(gamma_x_1, gamma_x_0, gamma_y_1, gamma_y_0)?;
    let c = g1_from_xy(&proof[6], &proof[7])?;
    let delta_neg = g2_from_xy(delta_x_1, delta_x_0, delta_y_1, delta_y_0)?;

    let product =
        pairing(a, b) * pairing(alpha, beta) * pairing(vk_x, gamma_neg) * pairing(c, delta_neg);
    if product == MyFq12::from(Fq12::one()) {
        Ok(())
    } else {
        Err(PairingFailed)
    }
}
