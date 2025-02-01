use calimero_sdk::borsh::{BorshDeserialize, BorshSerialize};
use calimero_sdk::app;
use calimero_storage::collections::UnorderedMap;
use std::str::FromStr;

#[app::event]
pub enum StoreEvent<'a> {
    ValueSet {
        position: &'a u8,
        value: &'a u8,
        editor: &'a str,
    },
}

#[app::state(emits = for<'a> StoreEvent<'a>)]
#[derive(Default, BorshSerialize, BorshDeserialize)]
#[borsh(crate = "calimero_sdk::borsh")]
struct BattleState {
    /// table[position] = (value, editor)
    table: UnorderedMap<String, (u8, String)>,
}

#[app::logic]
impl BattleState {
    #[app::init]
    pub fn init() -> Self {
        Self {
            table: UnorderedMap::new(),
        }
    }

    pub fn set(&mut self, position: u8, value: u8, editor_address: String) {
        app::emit!(StoreEvent::ValueSet {
            position: &position,
            value: &value,
            editor: &editor_address,
        });
        self.table
            .insert(position.to_string(), (value, editor_address))
            .unwrap();
    }
    
    pub fn get(&self, position: u8) -> Option<(u8, String)> {
        self.table.get(&position.to_string()).unwrap()
    }
    
    pub fn get_table(&self) -> Vec<(u8, u8, String)> {
        self.table.entries().unwrap().map(|(position, (value, editor))| {
            (u8::from_str(&position).unwrap(), value, editor)
        }).collect()
    }
}
