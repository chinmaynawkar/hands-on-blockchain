# Zero Knowledge Proofs (ZKPs)

## Overview (What & Why)

**What are Zero Knowledge Proofs?**

Imagine you want to prove to your friend that you know the answer to a secret riddle, but you don't want to tell them the answer. Zero Knowledge Proofs (ZKPs) are a way to prove you know something without revealing what it is. In the digital world, ZKPs let you prove facts about data (like your age, password, or a transaction) without sharing the data itself.

**Why are ZKPs Important?**

- **Privacy:** Prove things about yourself or your data without exposing private details.
- **Security:** Reduce the risk of data leaks and identity theft.
- **Trust:** Enable trustless systems—no need to trust a third party with your secrets.
- **Scalability:** Make blockchains faster by proving lots of things with small proofs.

ZKPs are used in cryptocurrencies (like Zcash), private voting, digital identity, and more.

---

## Core Concepts (The 20% That Matters Most)

### 1. The Prover and the Verifier

- **Prover:** The person (or computer) who knows the secret.
- **Verifier:** The person (or computer) who wants to check if the prover really knows the secret.

### 2. Zero Knowledge

- The verifier learns nothing about the secret—only that the prover knows it.

### 3. Completeness, Soundness, Zero-Knowledge

- **Completeness:** If the prover is honest, the verifier will be convinced.
- **Soundness:** If the prover is lying, the verifier won't be fooled (except with tiny probability).
- **Zero-Knowledge:** No information about the secret leaks.

### 4. Types of ZKPs

- **Interactive:** Prover and verifier talk back and forth (like 20 Questions).
- **Non-Interactive:** Prover sends one proof, verifier checks it (better for blockchains).

### 5. ZK-SNARKs and ZK-STARKs

- **ZK-SNARKs:** Small, fast proofs, but need a trusted setup.
- **ZK-STARKs:** No trusted setup, post-quantum secure, but proofs are bigger.

---

## Step-by-Step Implementation

Let's walk through a simple ZKP using a real-world analogy and then show how it's done in code.

### Analogy: The Magic Door (Ali Baba Cave)

- Peggy (prover) knows the secret word to open a magic door in a cave.
- Victor (verifier) waits outside and asks Peggy to come out from either side of the cave.
- If Peggy can always appear on the correct side, Victor is convinced she knows the secret, but never learns the word.

### Example: Proving You Know a Password Without Revealing It

#### Using zk-SNARKs with ZoKrates (for Ethereum)

**1. Install ZoKrates (Docker recommended):**

```bash
docker pull zokrates/zokrates
docker run -ti -v $(pwd):/home/zokrates zokrates/zokrates /bin/bash
```

**2. Write a simple ZoKrates program (password.zok):**

```zokrates
// Prove you know a secret password (e.g., 1234)
def main(private field password) -> bool {
    return password == 1234;
}
```

**3. Compile the program:**

```bash
zokrates compile -i password.zok
```

**4. Setup trusted setup:**

```bash
zokrates setup
```

**5. Compute the witness (your secret input):**

```bash
zokrates compute-witness -a 1234
```

**6. Generate the proof:**

```bash
zokrates generate-proof
```

**7. Verify the proof:**

```bash
zokrates verify
```

**8. Export a Solidity verifier contract (for Ethereum):**

```bash
zokrates export-verifier
```

#### Error Handling Example (ZoKrates)

- If you enter the wrong password, proof generation will fail.
- If the trusted setup is not run, you'll get an error about missing keys.
- Always check the output of each command for errors.

---

## Code Examples

### Example 1: Simple ZKP in Python (Pedersen Commitment)

```python
# This is a toy example, not for production use!
import random

# Public parameters
g = 2
h = 3
p = 101

# Prover's secret
x = 42
r = random.randint(1, p-1)

# Commitment
C = (pow(g, x, p) * pow(h, r, p)) % p

# Prover sends C to verifier
print(f"Commitment: {C}")

# To prove knowledge of x without revealing it, use a ZKP protocol (like Schnorr's protocol)
# In real applications, use libraries like PySNARK, ZoKrates, or snarkjs.
```

### Example 2: Using Circom and snarkjs (JavaScript)

- Write a circuit in Circom:

```circom
// circuit.circom
pragma circom 2.0.0;
template PasswordCheck() {
    signal input password;
    signal output isValid;
    isValid <== password == 1234;
}
component main = PasswordCheck();
```

- Compile and generate proof using snarkjs (see [snarkjs docs](https://github.com/iden3/snarkjs)).

---

## Best Practices

- **Use well-audited libraries:** Don't roll your own crypto. Use ZoKrates, snarkjs, gnark, or similar.
- **Keep secrets private:** Never log or expose private inputs.
- **Trusted setup:** For zk-SNARKs, ensure the trusted setup is secure (multi-party ceremonies are best).
- **Test with edge cases:** Try invalid and boundary inputs to ensure your circuit is correct.
- **Stay updated:** ZKP tech evolves fast—follow official docs and community updates.

---

## Common Pitfalls

- **Leaking secrets:** Accidentally exposing private data in logs or outputs.
- **Incorrect circuits:** Bugs in your circuit logic can make proofs invalid or insecure.
- **Ignoring setup:** Skipping or reusing trusted setup can break security.
- **Performance issues:** Large circuits can be slow to prove/verify—optimize where possible.
- **Not handling errors:** Always check for errors at each step (compilation, setup, proof, verification).

---

## Further Resources

- [Ethereum.org: Zero-Knowledge Proofs](https://ethereum.org/en/zero-knowledge-proofs/)
- [ZoKrates Documentation](https://zokrates.github.io/introduction.html)
- [snarkjs & Circom](https://docs.circom.io/)
- [ZKProof Community](https://zkproof.org/)
- [ZK-SNARKs Explained (Vitalik Buterin)](https://vitalik.ca/general/2022/06/15/using_snarks.html)
- [ZK-STARKs Overview](https://starkware.co/stark/)
- [Survey of ZKP Frameworks (arXiv)](https://arxiv.org/abs/2502.07063)

---

## Troubleshooting Tips

- **Proof fails to verify:** Double-check your inputs, circuit logic, and setup files.
- **Setup errors:** Make sure you've run the trusted setup and are using the correct keys.
- **Performance slow:** Try smaller circuits, or use more efficient proof systems (e.g., STARKs for large data).
- **Integration issues:** When deploying on-chain, ensure your verifier contract matches your proof system.
- **Library errors:** Check library versions and official documentation for breaking changes.

---

## Advanced: Patterns and Frameworks

- **ZK-Rollups:** Bundle many transactions into one proof for blockchain scalability (used in zkSync, StarkNet).
- **Private Voting:** Use ZKPs to prove a vote is valid without revealing the choice.
- **Decentralized Identity:** Prove you're over 18, or a citizen, without sharing your ID.
- **Verifiable Computation:** Prove a computation was done correctly (used in off-chain scaling).

---

## Summary

Zero Knowledge Proofs are a powerful tool for privacy and security in blockchain and beyond. They let you prove facts without revealing secrets, enabling new applications in finance, identity, and more. Start with simple circuits, use trusted libraries, and always follow best practices for security and privacy.
