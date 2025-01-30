use sp1_sdk::SP1ProofWithPublicValues;

pub mod sudoku;

#[async_trait::async_trait]
pub trait Game {
    async fn generate_proof(&self) -> anyhow::Result<SP1ProofWithPublicValues>;
    fn elf(&self) -> anyhow::Result<Vec<u8>>;
}