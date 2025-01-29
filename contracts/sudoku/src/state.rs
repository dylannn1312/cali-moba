use std::cell::RefCell;
use candid::{CandidType, Deserialize, Principal};
use icrc_ledger_types::icrc1::transfer::NumTokens;
use serde::Serialize;
use crate::game::SudokuGame;

thread_local! {
    pub(crate) static GAME_STORAGE: RefCell<Vec<SudokuGame>> = const { RefCell::new(Vec::new()) };
    pub(crate) static OWNER: RefCell<Principal> = const { RefCell::new(Principal::anonymous()) };
    pub(crate) static VK: RefCell<String> = RefCell::new("".to_string());
    pub(crate) static OWNER_PROFIT: RefCell<NumTokens> = RefCell::new(NumTokens::from(0u32));
    pub(crate) static VERIFIER: RefCell<Principal> = const { RefCell::new(Principal::anonymous()) };
}

#[derive(Serialize, Deserialize, CandidType, Debug)]
pub struct GlobalState {
    pub owner: Principal,
    pub vk: String,
    pub owner_profit: NumTokens,
    pub verifier: Principal,
}