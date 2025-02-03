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
        self.table
            .entries()
            .unwrap()
            .map(|(position, (value, editor))| (u8::from_str(&position).unwrap(), value, editor))
            .collect()
    }
}

#[cfg(test)]
mod tests {
    use calimero_sdk::borsh::{from_slice, BorshDeserialize, BorshSerialize};

    #[derive(BorshSerialize, BorshDeserialize, Debug)]
    #[borsh(crate = "calimero_sdk::borsh")]
    pub enum StoreEvent {
        ValueSet {
            position: u8,
            value: u8,
            editor: String,
        },
    }
    #[test]
    fn test() {
        let g = String::from_utf8_lossy(&[
            123, 34, 101, 100, 105, 116, 111, 114, 34, 58, 34, 119, 113, 102, 108, 110, 45, 121,
            121, 112, 109, 106, 45, 118, 119, 53, 109, 107, 45, 112, 115, 100, 121, 116, 45, 53,
            109, 110, 109, 122, 45, 121, 112, 101, 105, 122, 45, 108, 121, 53, 103, 98, 45, 103,
            122, 104, 122, 52, 45, 117, 108, 122, 103, 53, 45, 121, 108, 104, 101, 108, 45, 117,
            113, 101, 34, 44, 34, 112, 111, 115, 105, 116, 105, 111, 110, 34, 58, 49, 44, 34, 118,
            97, 108, 117, 101, 34, 58, 49, 125,
        ]);
        dbg!(g);
    }
}
