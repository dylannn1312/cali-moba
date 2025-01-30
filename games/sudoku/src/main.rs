#![no_main]

sp1_zkvm::entrypoint!(main);

/// Entrypoint for the zkVM program.
pub fn main() {
    let initial_state = sp1_zkvm::io::read::<Vec<(u8, u8)>>();
    let answer = sp1_zkvm::io::read::<Vec<u8>>();
    // let initial_state = vec![(0, 8), (1, 7), (7, 9), (14, 8), (17, 1)];
    // let answer = vec![
    //     1, 4, 5, 6, 2, 3,
    //     4, 5, 9, 2, 3, 6, 7,
    //     2, 3, 6, 1, 7, 9, 4, 5, 8,
    //     1, 2, 5, 8, 4, 3, 9, 6, 7,
    //     7, 6, 4, 9, 1, 5, 3, 8, 2,
    //     3, 9, 8, 6, 2, 7, 5, 1, 4,
    //     5, 8, 2, 3, 6, 1, 7, 4, 9,
    //     6, 1, 3, 7, 9, 4, 8, 2, 5,
    //     9, 4, 7, 5, 8, 2, 1, 3, 6
    // ];

    assert_eq!(initial_state.len() + answer.len(), 81, "wrong answer or initial state");

    let mut grid = [[0; 9]; 9];
    for (compressed_coordinate, value) in initial_state.clone() {
        assert!(1 <= value && value <= 9, "invalid initial state");
        let x = compressed_coordinate / 9;
        let y = compressed_coordinate % 9;
        grid[x as usize][y as usize] = value;
    }
    let mut ptr = 0;
    for i in 0..9 {
        for j in 0..9 {
            if grid[i][j] == 0 {
                assert!(1 <= answer[ptr] && answer[ptr] <= 9, "invalid answer");
                grid[i][j] = answer[ptr];
                ptr += 1;
            }
        }
    }

    // check rows
    for (i, row) in grid.iter().enumerate() {
        assert!(is_valid_group(row), "invalid row {}", i + 1);
    }

    // check columns
    for j in 0..9 {
        let mut column = [0; 9];
        for i in 0..9 {
            column[i] = grid[i][j];
        }
        assert!(is_valid_group(&column), "invalid column {}", j + 1);
    }

    // check squares
    for i in (0..9).step_by(3) {
        for j in (0..9).step_by(3) {
            let mut square = [0; 9];
            let mut ptr = 0;
            for x in 0..3 {
                for y in 0..3 {
                    square[ptr] = grid[i + x][j + y];
                    ptr += 1;
                }
            }
            assert!(is_valid_group(&square), "invalid square at ({}, {})", i + 1, j + 1);
        }
    }

    sp1_zkvm::io::commit(&initial_state);
}

fn is_valid_group(group: &[u8; 9]) -> bool {
    let mut seen = [false; 9];
    for x in group {
        if seen[(x - 1) as usize] {
            return false;
        }
        seen[(x - 1) as usize] = true;
    }
    true
}
