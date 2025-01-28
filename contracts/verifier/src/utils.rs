use std::str::FromStr;
use sha2::{Digest, Sha256};
use num_bigint::BigUint;
use num_traits::{FromBytes, ToBytes};
use crate::error::ContractError;

fn and_bytes32(src: &[u8; 32], key: &[u8; 32]) -> [u8; 32] {
    let mut result = [0; 32];
    for (i, (a, b)) in src.iter().zip(key).enumerate() {
        result[i] = a & b;
    }
    result
}

pub fn hash_public_values(public_values: &[u8]) -> Result<BigUint, ContractError> {
    Ok(BigUint::from_be_bytes(&and_bytes32(
        &Sha256::digest(public_values).to_vec().try_into().unwrap(),
        &BigUint::from_str("14474011154664524427946373126085988481658748083205070504932198000989141204991").unwrap().to_be_bytes().try_into().unwrap()
    )))
}