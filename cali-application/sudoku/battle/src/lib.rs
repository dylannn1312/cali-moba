use calimero_sdk::app;
use calimero_sdk::borsh::{BorshDeserialize, BorshSerialize};
use calimero_storage::collections::UnorderedMap;
use std::str::FromStr;

#[app::event]
pub enum StoreEvent<'a> {
    ValueSet {
        position: &'a u8,
        value: &'a u8,
        editor: &'a str,
        name: &'a str
    },
}

#[app::state(emits = for<'a> StoreEvent<'a>)]
#[derive(Default, BorshSerialize, BorshDeserialize)]
#[borsh(crate = "calimero_sdk::borsh")]
struct BattleState {
    /// table[position] = (value, editor)
    table: UnorderedMap<String, (u8, String, String)>,
}

#[app::logic]
impl BattleState {
    #[app::init]
    pub fn init() -> Self {
        Self {
            table: UnorderedMap::new(),
        }
    }

    pub fn set(&mut self, position: u8, value: u8, editor_address: String, editor_name: String) {
        app::emit!(StoreEvent::ValueSet {
            position: &position,
            value: &value,
            editor: &editor_address,
            name: &editor_name
        });
        self.table
            .insert(position.to_string(), (value, editor_address, editor_name))
            .unwrap();
    }

    pub fn get(&self, position: u8) -> Option<(u8, String, String)> {
        self.table.get(&position.to_string()).unwrap()
    }

    pub fn get_table(&self) -> Vec<(u8, u8, String, String)> {
        self.table
            .entries()
            .unwrap()
            .map(|(position, (value, editor, name))| (u8::from_str(&position).unwrap(), value, editor, name))
            .collect()
    }
}
