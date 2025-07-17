# Project Initialization Guide: Modern ZK Stack for cWETH/Iden3 (2024)

## 1. Project Structure

```
POC-cweth-id3/
  ├── circuits/      # Circom circuits for ZK proofs
  ├── contracts/     # Solidity smart contracts (verifiers, managers)
  ├── docs/          # Documentation for each POC step
  ├── frontend/      # React or Vite frontend for wallet UI
  ├── scripts/       # Helper scripts (setup, proof generation, etc.)
  └── README.md      # Project overview and instructions
```

---

## 2. Environment Setup

### Prerequisites

- Node.js v18+ (recommended)
- pnpm (or npm/yarn)
- Rust (for Circom 2)
- Circom 2 (latest)
- SnarkJS (latest)
- Hardhat (for Solidity dev)
- (Optional) Docker

### Install Core Tools

```sh
# Node.js (if not already installed)
nvm install 18
nvm use 18

# pnpm (recommended)
npm install -g pnpm

# Rust (for Circom)
curl --proto '=https' --tlsv1.2 https://sh.rustup.rs -sSf | sh

# Circom 2 (latest)
git clone https://github.com/iden3/circom.git
cd circom
cargo build --release
cargo install --path circom

# SnarkJS
npm install -g snarkjs

# Hardhat (in your project folder)
pnpm add -D hardhat
```

---

## 3. Initialize the Project

From inside `/POC-cweth-id3`:

```sh
# Initialize a new Node.js project (if not already)
pnpm init

# Add recommended dependencies
pnpm add -D hardhat @nomicfoundation/hardhat-toolbox
pnpm add -D circomlibjs snarkjs
pnpm add -D typescript ts-node

# For frontend (React/Vite)
pnpm create vite frontend -- --template react
cd frontend
pnpm install
cd ..
```

---

## 4. (Optional) Use a Starter Template

- [zk-starter (blockhackersio)](https://github.com/blockhackersio/zk-starter)
- [create-circom-project (advaita-saha)](https://github.com/advaita-saha/create-circom-project)
- [create-circom-circuit (pajicf)](https://github.com/pajicf/create-circom-circuit)

Clone and copy relevant files if you want a ready-made setup.

---

## 5. First Steps: Minimal POC

### A. Write a Simple Circom Circuit

`circuits/multiplier.circom`:

```circom
pragma circom 2.0.0;

template Multiplier() {
  signal input a;
  signal input b;
  signal output c;

  c <== a * b;
}

component main = Multiplier();
```

### B. Compile the Circuit

```sh
circom circuits/multiplier.circom --r1cs --wasm --sym -o build/
```

### C. Trusted Setup (Powers of Tau)

```sh
snarkjs powersoftau new bn128 12 pot12_0000.ptau -v
snarkjs powersoftau contribute pot12_0000.ptau pot12_0001.ptau --name="First contribution" -v
snarkjs powersoftau prepare phase2 pot12_0001.ptau pot12_final.ptau -v
snarkjs groth16 setup build/multiplier.r1cs pot12_final.ptau multiplier_0000.zkey
snarkjs zkey contribute multiplier_0000.zkey multiplier_final.zkey --name="1st Contributor Name" -v
snarkjs zkey export verificationkey multiplier_final.zkey verification_key.json
```

### D. Generate a Proof

```sh
# Prepare input.json
echo '{"a":3,"b":11}' > input.json

# Generate witness
node build/multiplier_js/generate_witness.js build/multiplier_js/multiplier.wasm input.json witness.wtns

# Generate proof
snarkjs groth16 prove multiplier_final.zkey witness.wtns proof.json public.json

# Verify proof
snarkjs groth16 verify verification_key.json public.json proof.json
```

### E. Generate Solidity Verifier

```sh
snarkjs zkey export solidityverifier multiplier_final.zkey contracts/MultiplierVerifier.sol
```

---

## 6. Next Steps: Integrate with Iden3 Libraries

- Use [go-iden3-crypto](https://github.com/iden3/go-iden3-crypto) for Baby JubJub, Poseidon, and ElGamal operations.
- Extend circuits for cWETH (deposit, transfer, withdraw) as described in your PRD.
- Use [circomlib](https://github.com/iden3/circomlib) for reusable circuit components.
- Build a React frontend to interact with your contracts and circuits.

---

## 7. Documentation and Learning Resources

- [Circom 2 Docs](https://docs.circom.io/)
- [SnarkJS Docs](https://github.com/iden3/snarkjs)
- [Iden3 Circom Circuits](https://github.com/iden3/circuits)
- [Iden3 Core Libraries](https://github.com/iden3)
- [zk-starter Template](https://github.com/blockhackersio/zk-starter)

---

## 8. Summary Table: Key Commands

| Task                       | Command/Action                                              |
| -------------------------- | ----------------------------------------------------------- |
| Install Circom             | `cargo install --path circom`                               |
| Compile circuit            | `circom circuits/your.circom --r1cs --wasm --sym -o build/` |
| Trusted setup (POT)        | `snarkjs powersoftau ...`                                   |
| Generate proof             | `snarkjs groth16 prove ...`                                 |
| Verify proof               | `snarkjs groth16 verify ...`                                |
| Generate Solidity verifier | `snarkjs zkey export solidityverifier ...`                  |
| Start frontend (Vite)      | `cd frontend && pnpm dev`                                   |
| Run Hardhat node           | `npx hardhat node`                                          |
| Deploy contracts           | `npx hardhat run scripts/deploy.js --network localhost`     |

---

**For any step, refer to the official docs or ask for help!**
