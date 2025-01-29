use crate::error::ContractError;
use crate::error::ContractError::InvalidProof;
use crate::groth16::verify_groth16_proof;
use crate::types::{ProofConsts, SP1Proof, SP1ProofWithPublicValues};
use crate::utils::hash_public_values;
use num_bigint::BigUint;
use num_traits::FromBytes;
use std::cell::RefCell;
use std::str::FromStr;

thread_local! {
    static PROOF_CONSTANTS: RefCell<ProofConsts> = RefCell::new(ProofConsts {
            r: BigUint::from_str("21888242871839275222246405745257275088548364400416034343698204186575808495617").unwrap(),
            q: BigUint::from_str("21888242871839275222246405745257275088696311157297823662689037894645226208583").unwrap(),
            alpha_x: BigUint::from_str(
                "20491192805390485299153009773594534940189261866228447918068658471970481763042",
            ).unwrap(),
            alpha_y: BigUint::from_str(
                "9383485363053290200918347156157836566562967994039712273449902621266178545958",
            ).unwrap(),
            beta_x_0: BigUint::from_str(
                "4252822878758300859123897981450591353533073413197771768651442665752259397132",
            ).unwrap(),
            beta_x_1: BigUint::from_str(
                "6375614351688725206403948262868962793625744043794305715222011528459656738731",
            ).unwrap(),
            beta_y_0: BigUint::from_str(
                "41207766310529818958173054109690360505148424997958324311878202295167071904",
            ).unwrap(),
            beta_y_1: BigUint::from_str(
                "11383000245469012944693504663162918391286475477077232690815866754273895001727",
            ).unwrap(),
            gamma_x_0: BigUint::from_str(
                "11559732032986387107991004021392285783925812861821192530917403151452391805634",
            ).unwrap(),
            gamma_x_1: BigUint::from_str(
                "10857046999023057135944570762232829481370756359578518086990519993285655852781",
            ).unwrap(),
            gamma_y_0: BigUint::from_str(
                "17805874995975841540914202342111839520379459829704422454583296818431106115052",
            ).unwrap(),
            gamma_y_1: BigUint::from_str(
                "13392588948715843804641432497768002650278120570034223513918757245338268106653",
            ).unwrap(),
            delta_x_0: BigUint::from_str(
                "15228921016905275799965683851057599185732146900672862119304638397355443707454",
            ).unwrap(),
            delta_x_1: BigUint::from_str(
                "20409334339251888712441068872870136503388893688417321778880931483231354129143",
            ).unwrap(),
            delta_y_0: BigUint::from_str(
                "7264328423023871043957062501982202910010974353266020262517510882033855725085",
            ).unwrap(),
            delta_y_1: BigUint::from_str(
                "19877240297427940090516929163964707799250026674662843458659550601453241207282",
            ).unwrap(),
            ic_x: [
                BigUint::from_str(
                    "1048662465858378462039546739271490393047466817500184066040897033812283855432",
                ).unwrap(),
                BigUint::from_str(
                    "8880870171820178879315138727491177243876706074048591778960954962478121292427",
                ).unwrap(),
                BigUint::from_str(
                    "1568022209015269256635037559407721536321962002203490351642786232392950111552",
                ).unwrap(),
            ],
            ic_y: [
                BigUint::from_str(
                    "19955603142782979624537809602226324406438922060777785976295407357266173213699",
                ).unwrap(),
                BigUint::from_str(
                    "9645782069397560173565155195986190258176410930403315934875366540532269958807",
                ).unwrap(),
                BigUint::from_str(
                    "7099579151192302668913697450512320120875549565559727060892675623506103788981",
                ).unwrap(),
            ],
        });
}

#[cfg_attr(not(feature = "library"), ic_cdk::query)]
pub fn verify_proof(proof: SP1ProofWithPublicValues, program_vkey: String) -> Result<(), ContractError> {
    match proof.proof {
        SP1Proof::Groth16(proof_bytes) => {
            let verifier_hash = hex::decode("090690902a12d1d02c07a1ad25aa76bded5f6499e12a11ba127669501b553998").unwrap();
            let proof_bytes = hex::decode(&proof_bytes).map_err(|_| ContractError::ParseHex(proof_bytes))?;
            let public_values = hex::decode(&proof.public_values).map_err(|_| ContractError::ParseHex(proof.public_values))?;
            let program_vkey = hex::decode(&program_vkey).map_err(|_| ContractError::ParseHex(program_vkey))?;

            let received_selector =
                u32::from_be_bytes(proof_bytes[0..4].to_vec().try_into().unwrap());
            let expected_selector =
                u32::from_be_bytes(verifier_hash[0..4].to_vec().try_into().unwrap());

            if received_selector != expected_selector {
                return Err(InvalidProof(format!(
                    "wrong verifier selector {}, {}",
                    received_selector, expected_selector
                )));
            }

            let public_values_digest = hash_public_values(&public_values)?;
            let inputs = [
                BigUint::from_be_bytes(&program_vkey),
                public_values_digest,
            ];

            let mut proof = [BigUint::ZERO; 8];
            for i in 0..8 {
                let offset = 4 + i * 32;
                let element = BigUint::from_be_bytes(
                    &proof_bytes[offset..offset + 32]
                );
                proof[i] = element;
            }
            PROOF_CONSTANTS.with(|proof_consts| {
                verify_groth16_proof(&proof, &inputs, &proof_consts.borrow())
            })
        }
    }
}

#[cfg(not(feature = "library"))]
ic_cdk::export_candid!();

#[cfg(test)]
mod tests {
    use crate::contract::verify_proof;
    use crate::types::SP1ProofWithPublicValues;

    #[test]
    fn test_verify_groth16_proof() {
        let proof_str = r#"
            {
                "proof": {
                    "groth16": "090690900ccb00af40d88b7661b74b0373620fa406f0afd96dcca40dc3f6a3e9923b0b190c5d1936ea6ddfccdf25e570086bdb82e6d995301f10fe46aff253c36895db2710d4f05e35196b2f090d9ad2962989394cc9e76bfc45335f2c109a477152147927fa310f38cabd7f004dd2a43c9f45cd35120fdbb938cd4322b3cc787ba6951e145f53d796614b541bf7f8103db6f3cb97c6e3d20e6ee4899faf6b88a4f5617418bd5fb833f721f3b46a1cc382be23015448f2969a06575866a37e03b488f1800cacf6d53935746625a0b52fe24599f29a6dfdc82c6938c58e0cfcb3e4eae3d01d71483c7a49c45cde9715d9b10b7bab074b41c1033536452d94ea3cacfda41a"
                },
                "public_values": "05000000000000000008010707090e0811018a97288ba412a16902a36abc5ec852fd7f728e2554ebd4a1161ea4b346feb751"
            }
        "#;
        let proof = serde_json::from_str::<SP1ProofWithPublicValues>(proof_str).unwrap();
        
        let program_vkey = "005c2cee42b6c34b25cebc2c6d2f5b9a7080bb31ca929d98f1deaddd2d842b62".to_string();
        
        verify_proof(proof, program_vkey).unwrap();
    }
}
