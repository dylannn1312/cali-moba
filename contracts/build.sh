#!/bin/bash

set -e  # Exit immediately if any command fails
set -o pipefail  # Ensure errors in piped commands are caught

# List of contracts to process
CONTRACTS=("verifier" "sudoku")

# Output directory for DID files
DID_OUTPUT_DIR="candid"

# Ensure output directory exists
mkdir -p "$DID_OUTPUT_DIR"

# Process each contract
for contract in "${CONTRACTS[@]}"; do
    WASM_PATH="../target/wasm32-unknown-unknown/release/${contract}.wasm"
    DID_PATH="../${DID_OUTPUT_DIR}/${contract}.did"

    # Build WASM binaries
    cd "$contract"
    pwd
    echo "Building WASM binaries..."
    cargo build --target wasm32-unknown-unknown --release

    echo "Extracting Candid for $contract..."
    candid-extractor "$WASM_PATH" > "$DID_PATH"
    echo "Candid file for $contract saved to $DID_PATH"

    cd ..
done

echo "All contracts processed successfully!"
