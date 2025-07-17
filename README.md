# 🧑‍💻 Blockchain Learning Monorepo

Welcome to the **Blockchain Learning** monorepo!  
This repository contains a comprehensive collection of resources, code, circuits, smart contracts, and documentation for learning and experimenting with blockchain, zero-knowledge proofs, and cryptography.

---

## 📚 Table of Contents

- [About](#about)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgements](#acknowledgements)

---

## 📝 About

This repository is designed for hands-on learning and experimentation with:

- **Zero-Knowledge Proofs (ZKP)**
- **Circom Circuits**
- **Smart Contracts (Solidity)**
- **zk-SNARKs/zk-STARKs**
- **Self-Sovereign Identity**
- **Cryptographic Primitives**
- And more!

Whether you are a student, developer, or researcher, this repo provides a modular and practical approach to mastering blockchain technologies.

---

## 🗂️ Project Structure

```plaintext
blockchain-learning/
│
├── circom/                  # Circom circuit development and Rust backend
├── circomlib/               # Circom standard library circuits and tests
├── Identity/                # Self-sovereign identity docs and schemas
├── md-files/                # Research notes and markdown documentation
├── memory-bank/             # Project context and system patterns
├── poc-cweth-id3/           # Proof-of-concept: cWETH integration with iden3
├── poc2-cWETH-commitment/   # cWETH commitment circuits and artifacts
├── solidity-smart-contracts/# Solidity contract notes and docs
├── zero-knowledge-proofs/   # ZKP concepts, circuits, and demo apps
├── zk-login/                # zkLogin circuits, server, and UI
├── zkapp/                   # zkApp demo frontend
└── ...
```

---

## 🚀 Getting Started

### 1. **Clone the Repository**

```sh
git clone https://github.com/chinmaynawkar/hands-on-blockchain.git
cd hands-on-blockchain
```

### 2. **Install Dependencies**

Each subproject may have its own dependencies.  
For example, to install dependencies for a Node.js project:

```sh
cd zero-knowledge-proofs/zkp
npm install
```

Or for Rust projects:

```sh
cd circom/circom
cargo build
```

### 3. **Explore the Projects**

- Read the `README.md` in each subfolder for specific instructions.
- Check out the `docs/` and `md-files/` for background and guides.

---

## 🛠️ Usage

- **Run Circom Circuits:**  
  See `circom/` and `circomlib/` for circuit compilation and testing.
- **Smart Contracts:**  
  Solidity contracts and notes are in `solidity-smart-contracts/`.
- **ZKP Demos:**  
  Try the demo apps in `zero-knowledge-proofs/` and `zkapp/`.
- **zkLogin:**  
  End-to-end zkLogin flow in `zk-login/`.

---

## 🤝 Contributing

Contributions are welcome!  
Please open issues or pull requests for improvements, bug fixes, or new features.

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/YourFeature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/YourFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

## 🙏 Acknowledgements

- [circom](https://github.com/iden3/circom)
- [snarkjs](https://github.com/iden3/snarkjs)
- [Ethereum](https://ethereum.org/)
- [iden3](https://iden3.io/)
- And all open-source contributors!

---

> **Happy hacking and learning! 🚀**
