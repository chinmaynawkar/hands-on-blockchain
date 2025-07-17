# ZKAge - Zero Knowledge Age Verification System

A privacy-preserving age verification system that uses zero-knowledge proofs to prove you're over 18 without revealing your exact age or birth date.

## 🎯 What is ZKAge?

ZKAge demonstrates how zero-knowledge proofs can solve real-world privacy problems. It allows users to prove they meet age requirements (18+) for services while keeping their actual birth date completely private.

### Key Features

- **🔐 Privacy-First**: Never reveals your actual age or birth date
- **✅ Verifiable**: Cryptographically provable age verification
- **🎭 Zero-Knowledge**: Proves only what's necessary (age ≥ 18)
- **🔧 Real ZK Technology**: Uses Circom, SnarkJS, and Poseidon hash
- **🌐 Browser-Based**: All computation happens locally

## 🛠️ Technology Stack

- **Circuit Language**: [Circom 2.0](https://docs.circom.io/)
- **Proof System**: Groth16 (via [SnarkJS](https://github.com/iden3/snarkjs))
- **Hash Function**: Poseidon (ZK-friendly cryptographic hash)
- **Libraries**: [circomlib](https://github.com/iden3/circomlib) for primitives
- **Frontend**: React 19 + Vite + Tailwind CSS

## 📋 Prerequisites

- Node.js 18+ and npm
- [Circom compiler](https://docs.circom.io/getting-started/installation/) installed globally
- At least 4GB RAM (for circuit compilation)

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Install Circom Globally

```bash
# Install Rust (if not already installed)
curl --proto '=https' --tlsv1.2 https://sh.rustup.rs -sSf | sh

# Install Circom
git clone https://github.com/iden3/circom.git
cd circom
cargo build --release
cargo install --path circom

# Verify installation
circom --version
```

### 3. Install Circuit Dependencies

```bash
npm run circuit:install
```

### 4. Compile the Age Verification Circuit

```bash
npm run circuit:compile
```

This generates:

- `public/circuits/age_proof.r1cs` - Circuit constraints
- `public/circuits/age_proof.wasm` - WebAssembly witness generator
- `public/circuits/age_proof.sym` - Symbol file for debugging

### 5. Setup Trusted Ceremony

```bash
npm run circuit:setup
```

This performs the trusted setup ceremony and generates:

- `public/circuits/age_proof_final.zkey` - Proving key
- `public/circuits/verification_key.json` - Verification key

⚠️ **Note**: This step can take 5-10 minutes depending on your machine.

### 6. Start the Development Server

```bash
npm run dev
```

Visit `http://localhost:5173` to use ZKAge!

## 🔬 Testing the Circuit

### Generate a Test Proof

```bash
# Generate proof for someone born on May 15, 1990
npm run circuit:prove "1990-05-15" "0x742fA5C4fEf5fa3c0A8cB3e6BC6e2b28Dd82eB58"
```

### Verify the Proof

```bash
npm run circuit:verify
```

### Generate Solidity Verifier

```bash
npm run circuit:verify --solidity
```

This creates `public/circuits/AgeVerifier.sol` for on-chain verification.

## 🏗️ Circuit Architecture

The age verification circuit (`circuits/age_proof.circom`) implements:

```circom
template AgeProof() {
    signal input doBTimestamp;    // Birth date (private)
    signal input address;         // User address (public)
    signal input currentTimestamp; // Current time (public)
    signal input ageThreshold;    // 18 years in seconds (public)
    signal input hash;           // Poseidon(address, doBTimestamp) (public)

    // Verify age >= 18
    signal age <== currentTimestamp - doBTimestamp;
    component lte = LessThan(252);
    lte.in[0] <== age;
    lte.in[1] <== ageThreshold;
    lte.out === 0;

    // Verify hash integrity
    component poseidon = Poseidon(2);
    poseidon.inputs[0] <== address;
    poseidon.inputs[1] <== doBTimestamp;
    hash === poseidon.out;
}
```

### What's Public vs Private

**Public (Visible to Verifier):**

- User's address/identifier
- Current timestamp
- Age threshold (18 years in seconds)
- Poseidon hash of address + birth date

**Private (Hidden from Verifier):**

- Exact birth date
- Exact age
- Any other personal information

## 🎮 How to Use ZKAge

### Step 1: Generate Keys

- Creates cryptographic keypair for identity

### Step 2: Enter Birth Date

- Input your birth date privately
- System calculates if you're 18+ locally

### Step 3: Load Circuit

- Loads the compiled age verification circuit
- Checks all required files are present

### Step 4: Generate Proof

- Creates zero-knowledge proof using your private data
- Only proves age ≥ 18, nothing more

### Step 5: Verify Proof

- Cryptographically verifies the proof
- Confirms authenticity without revealing private data

## 🔧 Development

### Project Structure

```
zkp/
├── circuits/           # Circom circuit files
│   └── age_proof.circom
├── scripts/           # Circuit automation scripts
│   ├── setup-circuit.js
│   ├── generate-proof.js
│   └── verify-proof.js
├── src/
│   ├── components/    # React components
│   ├── context/      # React context for state
│   └── utils/        # ZK proof utilities
└── public/circuits/  # Generated circuit files
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run circuit:install` - Install circomlib
- `npm run circuit:compile` - Compile circuit
- `npm run circuit:setup` - Trusted setup ceremony
- `npm run circuit:prove [birthDate] [address]` - Generate test proof
- `npm run circuit:verify` - Verify generated proof

### Circuit Development

To modify the circuit:

1. Edit `circuits/age_proof.circom`
2. Recompile: `npm run circuit:compile`
3. Re-setup: `npm run circuit:setup`
4. Test changes: `npm run circuit:prove`

## 🔒 Security Considerations

### Trusted Setup

- Uses Powers of Tau ceremony for universal setup
- Circuit-specific setup with random contributions
- **Production use requires multi-party ceremony**

### Privacy Guarantees

- Birth date never leaves your device
- Only proves age ≥ 18, not exact age
- Uses cryptographically secure Poseidon hash
- Zero-knowledge properties mathematically guaranteed

### Limitations

- Requires trust in circuit implementation
- Relies on honest timestamp input
- Browser-based implementation for demo purposes

## 📚 Educational Resources

### Zero-Knowledge Proofs

- [ZK-SNARKs Explained](https://blog.ethereum.org/2016/12/05/zksnarks-in-a-nutshell/)
- [Circom Documentation](https://docs.circom.io/)
- [Zero Knowledge Proofs: An Illustrated Primer](https://blog.cryptographyengineering.com/2014/11/27/zero-knowledge-proofs-illustrated-primer/)

### Circom & SnarkJS

- [Circom Tutorial](https://docs.circom.io/getting-started/writing-circuits/)
- [SnarkJS Guide](https://github.com/iden3/snarkjs)
- [Poseidon Hash](https://www.poseidon-hash.info/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with `npm run circuit:test`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Disclaimer

This is an educational demonstration. For production use:

- Conduct proper security audits
- Use multi-party trusted setup ceremonies
- Implement additional security measures
- Consider regulatory requirements

## 🙋‍♂️ Support

For questions or issues:

- Check the [Issues](https://github.com/your-repo/zkage/issues) page
- Review [Circom Documentation](https://docs.circom.io/)
- Ask in the [ZK Community](https://github.com/iden3/circom/discussions)

---

**Built with ❤️ for the ZK community**
