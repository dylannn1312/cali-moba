use ark_bn254::{G1Affine, G2Affine};
use crate::bn254::final_exp::final_exp_native;
use crate::bn254::miller_loop::miller_loop;
use crate::bn254::my_fq12::MyFq12;

pub fn pairing(p: G1Affine, q: G2Affine) -> MyFq12 {
    final_exp_native(miller_loop(&q, &p))
}
