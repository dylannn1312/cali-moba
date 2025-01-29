use crate::error::ContractError;
use crate::error::ContractError::InvalidSolution;

pub(crate) fn check_solution(initial_state: &[(u8, u8)], answer: &[u8]) -> Result<(), ContractError> {
    if initial_state.len() + answer.len() != 81 {
        return Err(InvalidSolution(
            "sum of initial state and answer length must be 81".to_string(),
        ));
    }

    let mut grid = [[0; 9]; 9];
    for (compressed_coordinate, value) in initial_state {
        if !(1..=9).contains(value) {
            return Err(InvalidSolution(
                "values in initial state must be between 1 and 9".to_string(),
            ));
        }
        let x = compressed_coordinate / 9;
        let y = compressed_coordinate % 9;
        grid[x as usize][y as usize] = *value;
    }
    let mut ptr = 0;
    for i in 0..9 {
        for j in 0..9 {
            if grid[i][j] == 0 {
                if !(1..=9).contains(&answer[ptr]) {
                    return Err(InvalidSolution(
                        "values in initial state must be between 1 and 9".to_string(),
                    ));
                }
                grid[i][j] = answer[ptr];
                ptr += 1;
            }
        }
    }

    // check rows
    for (i, row) in grid.iter().enumerate() {
        if !is_valid_group(row) {
            return Err(InvalidSolution(format!("invalid row {}", i + 1)));
        }
    }

    // check columns
    for j in 0..9 {
        let mut column = [0; 9];
        for i in 0..9 {
            column[i] = grid[i][j];
        }
        if !is_valid_group(&column) {
            return Err(InvalidSolution(format!("invalid column {}", j + 1)));
        }
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
            if !is_valid_group(&square) {
                return Err(InvalidSolution(format!("invalid square at ({}, {})", i + 1, j + 1)));
            }
        }
    }
    Ok(())
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