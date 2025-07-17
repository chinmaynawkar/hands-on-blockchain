# Iden3 ⇌ cWETH Integration Guide

_Version 0.1 — *living document*_

---

## Table of Contents

1. Executive Summary
2. Re-using & Extending the Iden3 Stack
3. Visual Comparison of the Two Stacks
4. Proof-of-Concept (PoC) Road-map (Beginner-friendly)
5. References & Further Reading

---

## 1. Executive Summary

The goal is to **add confidential ETH transfers (cWETH)** to an existing project that already leverages the **Iden3 self-sovereign identity stack**.  
Because both cWETH and Iden3 share the same core cryptographic primitives (Baby JubJub, Circom, zkSNARKs), we can **re-use most of Iden3’s infrastructure** instead of building everything from scratch.

Key take-aways:

- ✅ **High component overlap** — same curve, proving system, and circuit tooling.
- 🚀 **Fast integration path** — extend Iden3 libraries rather than rewrite.
- 🛠️ **3 phased PoC plan** — compile → prove → web-wallet demo.

---

## 2. Re-using & Extending the Iden3 Stack

Below is a breakdown of the most relevant Iden3 repos/components and **how they map to cWETH needs**.

| Iden3 Component                                                                            | GitHub / Docs                              | Role in Iden3                         | How to Re-use / Extend for cWETH                                                 |
| ------------------------------------------------------------------------------------------ | ------------------------------------------ | ------------------------------------- | -------------------------------------------------------------------------------- |
| **go-iden3-crypto**                                                                        | <https://github.com/iden3/go-iden3-crypto> | Baby JubJub curve ops, Poseidon hash  | • Use existing Baby JubJub implementation for cWETH key-pair ops                 |
| • Add **Twisted ElGamal** helpers (commitments) if missing                                 |
| **go-iden3-core**                                                                          | <https://github.com/iden3/go-iden3-core>   | Identity primitives, serialization    | • Extend `Identity` structs with **cWETH account metadata** (dual balances)      |
| **circuits**                                                                               | <https://github.com/iden3/circuits>        | Curated Circom circuits & tests       | • Fork and add **Deposit, Transfer, Withdraw** circuits described in cWETH paper |
| • Leverage existing Poseidon/EdDSA circuit templates                                       |
| **go-circuits**                                                                            | <https://github.com/iden3/go-circuits>     | Go helpers → JSON inputs for circuits | • Generate inputs for the new cWETH circuits                                     |
| **prover-server**                                                                          | <https://github.com/iden3/prover-server>   | REST wrapper around `snarkjs`         | • Re-use as drop-in prover for cWETH proofs                                      |
| **go-iden3-auth**                                                                          | <https://github.com/iden3/go-iden3-auth>   | ZK-based auth flows                   | • Example code for wallet ↔ proof flow; adapt for **cWETH signing + proving**    |
| **on-chain contracts**                                                                     | <https://github.com/iden3/contracts>       | Verifiers, state trees                | • Derive a new `CwethVerifier.sol` from existing verifier templates              |
| • Implement **dual-balance storage** in Solidity using patterns from Iden3 state contracts |

> **Tip — namespacing:** keep cWETH extensions in sub-modules (e.g. `cweth/*`) so upstream Iden3 updates can be merged cleanly.

### Suggested Extension Flow

1. **Add Twisted ElGamal** helpers to `go-iden3-crypto`.
2. **Fork circuits repo** → implement 3 cWETH circuits (`deposit.circom`, `transfer.circom`, `withdraw.circom`).
3. **Generate verifier contracts** with `snarkjs zkey export solidityverifier`.
4. **Compose a `CwethManager.sol`** contract that inherits Iden3 verifier base.
5. **Expose REST endpoints** via `prover-server` for the new circuits.
6. **Patch wallet front-end** to call prover API and interact with `CwethManager`.

---

## 3. Visual Comparison of the Two Stacks

```mermaid
graph TD
  subgraph Iden3 Stack (Identity Privacy)
    A1[Wallet / dApp] --> B1(Iden3 Auth Library)
    B1 --> C1[Prover Server]
    C1 --> D1[Circuits Repo]
    B1 --> E1[go-iden3-core]
    E1 --> F1[Sparse Merkle State]
    F1 --> G1[Identity Verifier Contracts]
  end

  subgraph cWETH Stack (Financial Privacy)
    A2[Wallet / dApp] --> B2[go-iden3-crypto + Twisted ElGamal]
    B2 --> C2[Prover Server (same)]
    C2 --> D2[cWETH Circom Circuits]
    A2 --> E2[cWETH Dual-Balance Logic]
    E2 --> G2[CwethManager.sol]
  end

  %% Shared components
  C1 --- C2
  D1 --- D2
  style C1 stroke-dasharray: 5 5
  style D1 stroke-dasharray: 5 5

  %% Legend
  classDef shared stroke-dasharray: 5 5
```

**Legend (dashed lines)** = _Shared across both stacks_.

### Where They Differ in a Web-Wallet Context

| Layer               | Iden3                                           | cWETH                                                            | Integration Note                                                 |
| ------------------- | ----------------------------------------------- | ---------------------------------------------------------------- | ---------------------------------------------------------------- |
| **Key Derivation**  | Baby JubJub key generated during identity setup | Baby JubJub key **derived from ECDSA sig** (`eth_signTypedData`) | Wallet can reuse same curve code; only derivation method differs |
| **State Storage**   | Sparse Merkle Trees on-chain                    | Dual ElGamal commitment + DH encrypted balances                  | Wallet must handle **pending vs actual** balances UI             |
| **Proof Inputs**    | Claims, state roots                             | Amounts, balances, nonces                                        | Proof UI can share form components (JSON → prover)               |
| **Smart Contracts** | Identity verifier + state tree management       | `CwethManager` with dual-balance & ERC-20 wrapper                | Contracts live side-by-side; share verifier base                 |

---

## 4. Proof-of-Concept (PoC) Road-map

### PoC-1 — _Key Derivation & Commitments_

| Goal  | Derive Baby JubJub key from wallet signature & compute first ElGamal commitment |
| ----- | ------------------------------------------------------------------------------- |
| Steps |

| 1️⃣ Use `ethers.js` to `eth_signTypedData_v4`  
| 2️⃣ Hash signature → private key (per spec)  
| 3️⃣ Leverage `go-iden3-crypto` to compute public key  
| 4️⃣ Implement small Go/TS script to produce `{C,D}` commitment |
| Success Criteria | JSON output matches formulas in §3.2 of cWETH paper |

### PoC-2 — _Deposit Circuit & On-chain Verification_

| Goal  | Generate and verify a **deposit proof** on a local Hardhat chain |
| ----- | ---------------------------------------------------------------- |
| Steps |

| 1️⃣ Fork `iden3/circuits` → add `deposit.circom`  
| 2️⃣ Compile → `.zkey` + Solidity verifier  
| 3️⃣ Deploy `CwethManager.sol` (includes verifier)  
| 4️⃣ Call `deposit()` with proof & inputs |
| Success Criteria | `deposit()` tx succeeds & events show encrypted balance |

### PoC-3 — _Web-Wallet Demo_

| Goal  | React/Vite wallet that wraps ETH into cWETH & shows private balance |
| ----- | ------------------------------------------------------------------- |
| Steps |

| 1️⃣ Start from example in `go-iden3-auth/examples/web-wallet`  
| 2️⃣ Add **“Wrap Confidential ETH”** button → triggers PoC-2 prover flow via REST  
| 3️⃣ Display **actual vs pending** balances decrypted client-side |
| Success Criteria | User can deposit 0.01 ETH privately & see balances update |

> **Learning Path:** complete PoCs sequentially — each builds mental models & code assets for the next.

---

## 5. References & Further Reading

- Confidential Wrapped Ethereum proposal — [Ethereum Research post](https://ethresear.ch/t/confidential-wrapped-ethereum/22622/1)
- Iden3 documentation — [docs.iden3.io](https://docs.iden3.io/)
- Iden3 GitHub org — <https://github.com/iden3>
- Circom 2 documentation — <https://docs.circom.io/>
- `snarkjs` guide — <https://github.com/iden3/snarkjs>

---

_Maintained by 🚀 **Cline** — PRs welcome._
