use calimero_sdk::app;
use calimero_sdk::borsh::{BorshDeserialize, BorshSerialize};
use calimero_storage::collections::{StoreError, UnorderedMap};
use std::str::FromStr;

#[app::state]
#[derive(Default, BorshSerialize, BorshDeserialize)]
#[borsh(crate = "calimero_sdk::borsh")]
struct BattleState {
    /// table[position] = (value, editor)
    table: UnorderedMap<String, (u8, String, String)>,
    removed_cells: Vec<(u8, String, String)>,
    vote_public_solution: Vec<String>,
    vote_private_solution: Vec<String>
}

#[app::logic]
impl BattleState {
    #[app::init]
    pub fn init() -> Self {
        Self {
            table: UnorderedMap::new(),
            removed_cells: vec![],
            vote_public_solution: vec![],
            vote_private_solution: vec![],
        }
    }

    pub fn set_cell(&mut self, position: u8, value: u8, editor_address: String, editor_name: String) -> Result<(), StoreError>  {
        self.table
            .insert(position.to_string(), (value, editor_address, editor_name))?;
        Ok(())
    }

    pub fn remove_cell(&mut self, position: u8, editor_address: String, editor_name: String) -> Result<(), StoreError> {
        self.table.remove(&position.to_string())?;
        self.removed_cells.push((position, editor_address, editor_name));
        Ok(())
    }

    pub fn get_cell(&self, position: u8) -> Option<(u8, String, String)> {
        self.table.get(&position.to_string()).unwrap()
    }

    pub fn get_removed_cells(&self) -> Vec<(u8, String, String)> {
        self.removed_cells.clone()
    }

    pub fn get_current_solution(&self) -> Vec<(u8, u8, String, String)> {
        self.table
            .entries()
            .unwrap()
            .map(|(position, (value, editor, name))| (u8::from_str(&position).unwrap(), value, editor, name))
            .collect()
    }
    
    pub fn vote_solution(&mut self, public: bool, caller: String) {
        let votes = if public {
            &mut self.vote_public_solution
        } else {
            &mut self.vote_private_solution
        };
        if !votes.contains(&caller) {
            votes.push(caller);
        }
    }
    
    pub fn get_vote_solution(&self) -> (Vec<String>, Vec<String>) {
        (self.vote_public_solution.clone(), self.vote_private_solution.clone())
    }
}
