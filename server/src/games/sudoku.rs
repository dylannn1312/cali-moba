use crate::games::Game;
use async_trait::async_trait;
use sp1_sdk::network::proto::network::ProofMode;
use sp1_sdk::{NetworkProverV1, Prover, ProverClient, SP1ProofWithPublicValues, SP1Stdin};
use std::env::var;
use std::fs::File;
use std::io::Read;
use std::path::PathBuf;
use std::time::Duration;
use std::env;

pub struct SudokuGame {
    pub initial_state: Vec<(u8, u8)>,
    pub solution: Vec<u8>,
}

#[async_trait]
impl Game for SudokuGame {
    async fn generate_proof(&self) -> anyhow::Result<SP1ProofWithPublicValues> {
        let mut stdin = SP1Stdin::new();
        stdin.write(&self.initial_state);
        stdin.write(&self.solution);
        
        let elf = self.elf()?;
        let elf = elf.as_slice();
        
        let proof = if var("SP1_PROVER_KEY").is_ok() {
            env::set_var("SP1_PRIVATE_KEY", var("SP1_PROVER_KEY")?);
            let client = NetworkProverV1::new();
            let (_pk, vk) = client.setup(elf);
            let proof = client
                .prove(
                    elf,
                    stdin,
                    ProofMode::Groth16,
                    Some(Duration::from_secs(3600)),
                )
                .await?;
            client.verify(&proof, &vk)?;
            proof
        } else {
            let client = ProverClient::new();
            let (pk, vk) = client.setup(elf);
            let proof = client.prove(&pk, stdin).groth16().run()?;
            client.verify(&proof, &vk)?;
            proof
        };

        // let proof: SP1ProofWithPublicValues = serde_json::from_slice(include_bytes!("../../proof.json"))?;
        // let vk: SP1VerifyingKey = serde_json::from_slice(include_bytes!("../../vk.json"))?;
        // fs::write("../../proof.json", serde_json::to_string(&proof)?)?;
        // fs::write("vk.json", serde_json::to_string(&vk)?)?;
        println!("Proof created successfully");

        Ok(proof)
    }

    fn elf(&self) -> anyhow::Result<Vec<u8>> {
        let mut buffer = Vec::new();
        File::open(
            PathBuf::from(env!("CARGO_MANIFEST_DIR"))
                .join("../games/sudoku/elf/riscv32im-succinct-zkvm-elf"),
        )?
        .read_to_end(&mut buffer)?;
        Ok(buffer)
    }
}

#[cfg(test)]
mod tests {
    use crate::games::sudoku::SudokuGame;
    use crate::games::Game;
    use dotenv::dotenv;
    use ethers::prelude::{
        abigen, Address, Bytes, Http, LocalWallet, Middleware, Provider, Signer, SignerMiddleware,
    };
    use ethers::utils::hex;
    use std::env::var;
    use std::fs;
    use std::str::FromStr;
    use std::sync::Arc;

    #[tokio::test]
    async fn test_generate_proof() {
        dotenv().ok();
        let initial_state = vec![(0, 8), (1, 7), (7, 9), (14, 8), (17, 1)];
        let answer = vec![
            1, 4, 5, 6, 2, 3, 4, 5, 9, 2, 3, 6, 7, 2, 3, 6, 1, 7, 9, 4, 5, 8, 1, 2, 5, 8, 4, 3, 9,
            6, 7, 7, 6, 4, 9, 1, 5, 3, 8, 2, 3, 9, 8, 6, 2, 7, 5, 1, 4, 5, 8, 2, 3, 6, 1, 7, 4, 9,
            6, 1, 3, 7, 9, 4, 8, 2, 5, 9, 4, 7, 5, 8, 2, 1, 3, 6,
        ];
        let game = SudokuGame {
            initial_state,
            solution: answer,
        };
        let proof = game.generate_proof().await.unwrap();
        fs::write(
            "public_values_bytes",
            Bytes::from(proof.public_values.to_vec()).to_string(),
        )
        .unwrap();
        fs::write("proof_bytes", Bytes::from(proof.bytes()).to_string()).unwrap();
    }

    #[tokio::test]
    async fn test_verify_on_ether() {
        dotenv().ok();

        abigen!(
            VerifierContract,
            r"[
            function verifyProof(bytes32 programVKey,bytes calldata publicValues,bytes calldata proofBytes) external view
        ]"
        );

        let provider =
            Provider::<Http>::try_from("https://ethereum-holesky-rpc.publicnode.com").unwrap();
        let wallet = LocalWallet::from_str(&var("HOLESKY_PVK_TEST").unwrap())
            .unwrap()
            .with_chain_id(provider.get_chainid().await.unwrap().as_u64());
        let signer = SignerMiddleware::new(Arc::new(provider), wallet.clone());

        let contract = VerifierContract::new(
            Address::from_str("0x397A5f7f3dBd538f23DE225B51f532c34448dA9B").unwrap(),
            signer.into(),
        );

        let vk = hex::decode(fs::read_to_string("../games/sudoku/elf/verifying_key_hex").unwrap()).unwrap();
        let public_values = hex::decode(fs::read_to_string("public_values_bytes").unwrap()).unwrap();
        let proof_bytes = hex::decode(fs::read_to_string("proof_bytes").unwrap()).unwrap();
        let tx = contract.verify_proof(
            vk.try_into().unwrap(),
            Bytes::from(public_values),
            Bytes::from(proof_bytes),
        );
        let tx = tx.send().await.unwrap().await.unwrap().unwrap();
        dbg!(tx.transaction_hash);
    }
}
