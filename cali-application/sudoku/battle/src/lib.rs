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
    last_changed_cell: Option<(u8, u8, String, String)>,
    last_removed_cell: Option<u8>
}

#[app::logic]
impl BattleState {
    #[app::init]
    pub fn init() -> Self {
        Self {
            table: UnorderedMap::new(),
            last_changed_cell: None,
            last_removed_cell: None
        }
    }

    pub fn set_cell(&mut self, position: u8, value: u8, editor_address: String, editor_name: String) -> Result<(), StoreError>  {
        self.table
            .insert(position.to_string(), (value, editor_address.clone(), editor_name.clone()))?;
        self.last_changed_cell = Some((position, value, editor_address, editor_name));
        Ok(())
    }

    pub fn remove_cell(&mut self, position: u8) -> Result<(), StoreError> {
        self.table.remove(&position.to_string())?;
        Ok(())
    }

    pub fn get_cell(&self, position: u8) -> Option<(u8, String, String)> {
        self.table.get(&position.to_string()).unwrap()
    }

    pub fn get_last_changed_cell(&self) -> Option<(u8, u8, String, String)> {
        self.last_changed_cell.clone()
    }

    pub fn get_last_removed_cell(&self) -> Option<u8> {
        self.last_removed_cell
    }

    pub fn get_table(&self) -> Vec<(u8, u8, String, String)> {
        self.table
            .entries()
            .unwrap()
            .map(|(position, (value, editor, name))| (u8::from_str(&position).unwrap(), value, editor, name))
            .collect()
    }
}
