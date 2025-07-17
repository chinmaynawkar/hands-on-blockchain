# Basic Cryptography Concepts

## Overview (What & Why We Need Crypto)

**What is Cryptography?**

Think of cryptography as the art of secret writing and secure communication. Just like how you might create a secret code with your friends, cryptography creates mathematical "codes" that protect information. But instead of simple letter substitutions, it uses complex math that would take computers thousands of years to break.

**Why is This Important for Blockchain?**

- **Security:** Protects your digital money and data from hackers
- **Identity:** Proves you are who you say you are without revealing personal details
- **Integrity:** Ensures data hasn't been tampered with
- **Trust:** Enables strangers to interact safely without intermediaries

Modern cryptography is like having an unbreakable digital safe that only you can open, even though everyone can see the safe itself.

---

## Core Concepts (The 20% That Powers 80% of Blockchain)

### 1. Hash Functions: Digital Fingerprints 🔍

**What They Are:** Think of a hash function like a magical blender. No matter what you put in (a single letter, a book, or an entire movie), it always produces a "smoothie" of exactly the same size - a unique fingerprint for your input.

**Key Properties:**

- **Deterministic:** Same input always produces same output
- **Fixed Size:** Always produces same length output (e.g., 256 bits)
- **Avalanche Effect:** Tiny input change = completely different output
- **One-Way:** Easy to compute, impossible to reverse

#### Keccak-256 Example (Ethereum's Hash):

```
Input: "Hello"     → Output: 0x1c8aff950685c2ed4bc3174f3472287b...
Input: "Hello!"    → Output: 0x334d016f755cd6dc58c905e0b9d9c6a2...
```

### 2. Digital Signatures: Unforgeable Autographs ✍️

**Real-World Analogy:** Imagine if your handwritten signature was mathematically impossible to forge, and anyone could verify it's really yours, but only you could create it.

**How They Work:**

1. You have a **private key** (your secret signing pen)
2. You have a **public key** (your signature verification card)
3. Sign with private key, others verify with public key

### 3. Public/Private Key Pairs: The Master Key System 🔐

**Think of it like this:**

- **Private Key:** Your house key that you NEVER share
- **Public Key:** A special lockbox address that anyone can use to send you secure mail

**The Magic:** Messages locked with your public key can ONLY be opened with your private key!

### 4. Essential Math: The Building Blocks 🧮

Don't worry - we'll make this simple! These math concepts are like the ingredients in cryptographic recipes.

#### Modular Arithmetic (Clock Math)

Think of a 12-hour clock. If it's 10 o'clock and you add 5 hours, you get 3 o'clock (not 15). That's modular arithmetic!

#### Group Theory (Pattern Rules)

Like rules for a special club: certain operations follow specific patterns that make cryptography secure.

---

## Step-by-Step Implementation

Let's build these concepts from scratch with working Solidity code!

### Hash Functions in Action

#### Keccak-256 Implementation (Solidity)

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title HashDemo
 * @dev Educational contract demonstrating hash function properties
 */
contract HashDemo {

    /**
     * @dev Demonstrate hash function properties
     * @param message1 First input string
     * @param message2 Second input string
     * @return hash1 Hash of first message
     * @return hash2 Hash of second message
     * @return areEqual Whether the hashes are equal
     */
    function demonstrateHashProperties(
        string memory message1,
        string memory message2
    ) public pure returns (
        bytes32 hash1,
        bytes32 hash2,
        bool areEqual
    ) {
        // Create hashes (like digital fingerprints)
        hash1 = keccak256(abi.encodePacked(message1));
        hash2 = keccak256(abi.encodePacked(message2));

        // Check if they're the same
        areEqual = (hash1 == hash2);
    }

    /**
     * @dev Show deterministic property - same input always gives same output
     * @param message The input string to hash
     * @return hash The keccak256 hash
     * @return isDeterministic Always true for same input
     */
    function showDeterministicProperty(string memory message)
        public
        pure
        returns (bytes32 hash, bool isDeterministic)
    {
        bytes32 hash1 = keccak256(abi.encodePacked(message));
        bytes32 hash2 = keccak256(abi.encodePacked(message));

        hash = hash1;
        isDeterministic = (hash1 == hash2); // Always true!
    }

    /**
     * @dev Demonstrate avalanche effect - tiny change = big difference
     * @return hash1 Hash of "Hello"
     * @return hash2 Hash of "Hello!"
     * @return dramaticallyDifferent Whether hashes are very different
     */
    function showAvalancheEffect()
        public
        pure
        returns (bytes32 hash1, bytes32 hash2, bool dramaticallyDifferent)
    {
        hash1 = keccak256(abi.encodePacked("Hello"));
        hash2 = keccak256(abi.encodePacked("Hello!"));

        // Even one character change creates completely different hash
        dramaticallyDifferent = (hash1 != hash2);
    }
}
```

### Digital Signatures from Scratch

#### ECDSA Signature Verification (Ethereum Style)

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title SignatureDemo
 * @dev Educational contract demonstrating ECDSA signature verification
 */
contract SignatureDemo {

    /**
     * @dev Verify an ECDSA signature
     * @param messageHash The hash of the original message
     * @param signature The signature bytes (65 bytes: r, s, v)
     * @param expectedSigner The address that should have signed
     * @return isValid Whether the signature is valid
     */
    function verifySignature(
        bytes32 messageHash,
        bytes memory signature,
        address expectedSigner
    ) public pure returns (bool isValid) {
        // Extract r, s, v from signature
        bytes32 r;
        bytes32 s;
        uint8 v;

        // Check signature length
        if (signature.length != 65) {
            return false;
        }

        // Split signature into r, s, v
        assembly {
            r := mload(add(signature, 32))
            s := mload(add(signature, 64))
            v := byte(0, mload(add(signature, 96)))
        }

        // Recover the signer's address
        address recoveredSigner = ecrecover(messageHash, v, r, s);

        // Check if recovered address matches expected signer
        isValid = (recoveredSigner == expectedSigner && recoveredSigner != address(0));
    }

    /**
     * @dev Create a message hash in Ethereum format
     * @param message The original message
     * @return messageHash The Ethereum-style message hash
     */
    function getEthereumMessageHash(string memory message)
        public
        pure
        returns (bytes32 messageHash)
    {
        // Ethereum adds prefix to prevent signing attacks
        bytes memory prefix = "\x19Ethereum Signed Message:\n";
        bytes memory lengthBytes = bytes(toString(bytes(message).length));

        messageHash = keccak256(abi.encodePacked(prefix, lengthBytes, message));
    }

    /**
     * @dev Complete signature verification with message
     * @param message The original message
     * @param signature The signature
     * @param expectedSigner Expected signer address
     * @return isValid Whether signature is valid for the message
     */
    function verifyMessageSignature(
        string memory message,
        bytes memory signature,
        address expectedSigner
    ) public pure returns (bool isValid) {
        bytes32 messageHash = getEthereumMessageHash(message);
        return verifySignature(messageHash, signature, expectedSigner);
    }

    // Helper function to convert uint to string
    function toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) return "0";

        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }

        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }

        return string(buffer);
    }
}
```

### Essential Math Made Simple

#### Modular Arithmetic in Solidity

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title ModularMathDemo
 * @dev Educational contract demonstrating modular arithmetic
 */
contract ModularMathDemo {

    /**
     * @dev Demonstrate clock math (modular arithmetic)
     * @param currentHour Current hour (0-11)
     * @param hoursToAdd Hours to add
     * @return newHour The resulting hour after addition
     */
    function clockMath(uint256 currentHour, uint256 hoursToAdd)
        public
        pure
        returns (uint256 newHour)
    {
        // 12-hour clock arithmetic
        newHour = (currentHour + hoursToAdd) % 12;
    }

    /**
     * @dev Demonstrate modular exponentiation (used in crypto)
     * @param base The base number
     * @param exponent The exponent
     * @param modulus The modulus
     * @return result (base^exponent) mod modulus
     */
    function modularExponentiation(
        uint256 base,
        uint256 exponent,
        uint256 modulus
    ) public pure returns (uint256 result) {
        require(modulus > 0, "Modulus must be positive");

        // Use Solidity's built-in modular exponentiation
        result = modExp(base, exponent, modulus);
    }

    /**
     * @dev Demonstrate multiplicative inverse
     * @param a The number to find inverse for
     * @param m The modulus (must be prime)
     * @return inverse The multiplicative inverse
     */
    function multiplicativeInverse(uint256 a, uint256 m)
        public
        pure
        returns (uint256 inverse)
    {
        // Using Fermat's little theorem: a^(p-1) ≡ 1 (mod p)
        // So a^(p-2) ≡ a^(-1) (mod p) when p is prime
        require(m > 2, "Modulus must be greater than 2");
        inverse = modExp(a, m - 2, m);
    }

    /**
     * @dev Helper function for modular exponentiation
     */
    function modExp(uint256 base, uint256 exp, uint256 mod)
        internal
        pure
        returns (uint256 result)
    {
        result = 1;
        base = base % mod;

        while (exp > 0) {
            if (exp % 2 == 1) {
                result = (result * base) % mod;
            }
            exp = exp >> 1;
            base = (base * base) % mod;
        }
    }
}
```

---

## Code Examples

### Complete Hash Function Toolkit

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title HashToolkit
 * @dev A complete toolkit for understanding hash functions in Solidity
 */
contract HashToolkit {

    // Event for mining simulation
    event HashFound(uint256 nonce, bytes32 hash, uint256 gasUsed);

    /**
     * @dev Compare different hash functions available in Solidity
     * @param message Input message
     * @return keccak256Hash Keccak-256 hash
     * @return sha256Hash SHA-256 hash
     * @return ripemd160Hash RIPEMD-160 hash
     */
    function hashComparison(string memory message)
        public
        pure
        returns (
            bytes32 keccak256Hash,
            bytes32 sha256Hash,
            bytes20 ripemd160Hash
        )
    {
        bytes memory messageBytes = abi.encodePacked(message);

        keccak256Hash = keccak256(messageBytes);
        sha256Hash = sha256(messageBytes);
        ripemd160Hash = ripemd160(messageBytes);
    }

    /**
     * @dev Simulate Bitcoin-style proof of work mining
     * @param baseMessage The base message to mine
     * @param targetZeros Number of leading zeros required
     * @return nonce The successful nonce
     * @return hash The resulting hash
     */
    function miningSimulation(string memory baseMessage, uint8 targetZeros)
        public
        returns (uint256 nonce, bytes32 hash)
    {
        require(targetZeros <= 8, "Too many zeros - would be too expensive");

        uint256 startGas = gasleft();
        bytes32 target = bytes32(uint256(1) << (256 - 4 * targetZeros)) - 1;

        for (nonce = 0; nonce < 1000000; nonce++) {
            hash = keccak256(abi.encodePacked(baseMessage, nonce));

            if (hash <= target) {
                uint256 gasUsed = startGas - gasleft();
                emit HashFound(nonce, hash, gasUsed);
                return (nonce, hash);
            }
        }

        revert("No valid hash found within limit");
    }

    /**
     * @dev Demonstrate hash collision resistance
     * @param inputs Array of different inputs
     * @return hashes Array of resulting hashes
     * @return hasCollision Whether any collisions were found
     */
    function collisionTest(string[] memory inputs)
        public
        pure
        returns (bytes32[] memory hashes, bool hasCollision)
    {
        hashes = new bytes32[](inputs.length);

        // Hash all inputs
        for (uint i = 0; i < inputs.length; i++) {
            hashes[i] = keccak256(abi.encodePacked(inputs[i]));
        }

        // Check for collisions
        for (uint i = 0; i < hashes.length; i++) {
            for (uint j = i + 1; j < hashes.length; j++) {
                if (hashes[i] == hashes[j]) {
                    hasCollision = true;
                    return (hashes, hasCollision);
                }
            }
        }

        hasCollision = false;
    }
}
```

### Digital Signature Verification System

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title SignatureSystem
 * @dev Complete digital signature verification system
 */
contract SignatureSystem {

    // Events for signature operations
    event SignatureVerified(address signer, bytes32 messageHash, bool isValid);
    event MessageSigned(address signer, string message);

    // Mapping to track verified signatures
    mapping(bytes32 => bool) public verifiedSignatures;
    mapping(address => uint256) public signatureCount;

    /**
     * @dev Verify and store signature
     * @param message The original message
     * @param signature The signature bytes
     * @param expectedSigner Expected signer address
     * @return isValid Whether signature is valid
     */
    function verifyAndStore(
        string memory message,
        bytes memory signature,
        address expectedSigner
    ) external returns (bool isValid) {
        bytes32 messageHash = getEthereumMessageHash(message);
        isValid = verifySignature(messageHash, signature, expectedSigner);

        if (isValid) {
            verifiedSignatures[messageHash] = true;
            signatureCount[expectedSigner]++;
            emit MessageSigned(expectedSigner, message);
        }

        emit SignatureVerified(expectedSigner, messageHash, isValid);
    }

    /**
     * @dev Batch verify multiple signatures
     * @param messages Array of messages
     * @param signatures Array of signatures
     * @param signers Array of expected signers
     * @return results Array of verification results
     */
    function batchVerify(
        string[] memory messages,
        bytes[] memory signatures,
        address[] memory signers
    ) external view returns (bool[] memory results) {
        require(
            messages.length == signatures.length &&
            signatures.length == signers.length,
            "Array lengths must match"
        );

        results = new bool[](messages.length);

        for (uint i = 0; i < messages.length; i++) {
            bytes32 messageHash = getEthereumMessageHash(messages[i]);
            results[i] = verifySignature(messageHash, signatures[i], signers[i]);
        }
    }

    /**
     * @dev Create Ethereum message hash
     */
    function getEthereumMessageHash(string memory message)
        public
        pure
        returns (bytes32)
    {
        bytes memory prefix = "\x19Ethereum Signed Message:\n";
        return keccak256(abi.encodePacked(
            prefix,
            toString(bytes(message).length),
            message
        ));
    }

    /**
     * @dev Verify ECDSA signature
     */
    function verifySignature(
        bytes32 messageHash,
        bytes memory signature,
        address expectedSigner
    ) public pure returns (bool) {
        if (signature.length != 65) return false;

        bytes32 r;
        bytes32 s;
        uint8 v;

        assembly {
            r := mload(add(signature, 32))
            s := mload(add(signature, 64))
            v := byte(0, mload(add(signature, 96)))
        }

        address recoveredSigner = ecrecover(messageHash, v, r, s);
        return (recoveredSigner == expectedSigner && recoveredSigner != address(0));
    }

    // Helper function to convert uint to string
    function toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) return "0";

        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }

        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }

        return string(buffer);
    }
}
```

---

## Best Practices

### Security Best Practices 🔒

1. **Always Use Latest Solidity Version**

   ```solidity
   // ✅ DO: Use latest stable version
   pragma solidity ^0.8.19;

   // ❌ DON'T: Use outdated versions
   pragma solidity ^0.6.0; // Vulnerable to many issues
   ```

2. **Proper Input Validation**

   ```solidity
   // ✅ DO: Validate all inputs
   function secureHash(string calldata input) external pure returns (bytes32) {
       require(bytes(input).length > 0, "Input cannot be empty");
       require(bytes(input).length <= 1000, "Input too long");
       return keccak256(abi.encodePacked(input));
   }

   // ❌ DON'T: Skip validation
   function insecureHash(string calldata input) external pure returns (bytes32) {
       return keccak256(abi.encodePacked(input)); // No validation!
   }
   ```

3. **Safe Signature Verification**

   ```solidity
   // ✅ DO: Check for zero address
   function safeVerify(bytes32 hash, bytes memory sig) public pure returns (address) {
       address signer = ecrecover(hash, v, r, s);
       require(signer != address(0), "Invalid signature");
       return signer;
   }

   // ❌ DON'T: Ignore zero address
   function unsafeVerify(bytes32 hash, bytes memory sig) public pure returns (address) {
       return ecrecover(hash, v, r, s); // Could return address(0)!
   }
   ```

### Gas Optimization ⚡

```solidity
contract GasOptimizedCrypto {

    // ✅ DO: Use immutable for constants
    bytes32 public immutable DOMAIN_SEPARATOR;

    constructor() {
        DOMAIN_SEPARATOR = keccak256("MyContract");
    }

    // ✅ DO: Pack structs efficiently
    struct OptimizedData {
        uint128 value1;  // 16 bytes
        uint128 value2;  // 16 bytes - fits in one slot
        bool flag;       // 1 byte - new slot
    }

    // ✅ DO: Use events for cheap storage
    event DataHashed(bytes32 indexed hash, address indexed user);

    function efficientHash(string calldata data) external {
        bytes32 hash = keccak256(abi.encodePacked(data));
        emit DataHashed(hash, msg.sender); // Cheaper than storage
    }
}
```

---

## Common Pitfalls

### 1. Hash Collision Confusion 🤔

**Myth:** "Hash collisions mean the function is broken"
**Reality:** Some collisions are theoretically possible but practically impossible

```solidity
contract CollisionDemo {
    /**
     * @dev Educational demonstration of hash properties
     * Note: Finding actual collisions would take longer than the universe exists!
     */
    function demonstrateCollisionResistance(string[] memory inputs)
        public
        pure
        returns (bool foundCollision)
    {
        for (uint i = 0; i < inputs.length; i++) {
            for (uint j = i + 1; j < inputs.length; j++) {
                bytes32 hash1 = keccak256(abi.encodePacked(inputs[i]));
                bytes32 hash2 = keccak256(abi.encodePacked(inputs[j]));

                if (hash1 == hash2 &&
                    keccak256(abi.encodePacked(inputs[i])) !=
                    keccak256(abi.encodePacked(inputs[j]))) {
                    return true; // Extremely unlikely!
                }
            }
        }
        return false;
    }
}
```

### 2. Signature Malleability Issues 🗝️

```solidity
contract SignaturePitfalls {

    // ❌ VULNERABLE: Signature malleability
    function vulnerableVerify(bytes32 hash, uint8 v, bytes32 r, bytes32 s)
        public
        pure
        returns (address)
    {
        return ecrecover(hash, v, r, s); // Malleable!
    }

    // ✅ SECURE: Protect against malleability
    function secureVerify(bytes32 hash, uint8 v, bytes32 r, bytes32 s)
        public
        pure
        returns (address)
    {
        // Check s value is in lower half of curve order
        require(uint256(s) <= 0x7FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF5D576E7357A4501DDFE92F46681B20A0,
                "Invalid signature 's' value");

        require(v == 27 || v == 28, "Invalid signature 'v' value");

        address signer = ecrecover(hash, v, r, s);
        require(signer != address(0), "Invalid signature");

        return signer;
    }
}
```

### 3. Reentrancy in Crypto Operations 📊

```solidity
contract ReentrancyExample {
    mapping(address => uint256) public balances;
    mapping(bytes32 => bool) public processedHashes;

    // ❌ VULNERABLE: State change after external call
    function vulnerableProcess(string memory data) external {
        bytes32 hash = keccak256(abi.encodePacked(data, msg.sender));

        require(!processedHashes[hash], "Already processed");

        // External call before state change - DANGEROUS!
        (bool success,) = msg.sender.call("");
        require(success, "Call failed");

        processedHashes[hash] = true; // Too late!
    }

    // ✅ SECURE: State changes first (CEI pattern)
    function secureProcess(string memory data) external {
        bytes32 hash = keccak256(abi.encodePacked(data, msg.sender));

        require(!processedHashes[hash], "Already processed");

        // State change FIRST
        processedHashes[hash] = true;

        // External call LAST
        (bool success,) = msg.sender.call("");
        require(success, "Call failed");
    }
}
```

---

## Troubleshooting Guide

### Common Errors and Solutions

#### 1. "Transaction reverted without a reason string"

**Problem:** Usually means a require() failed without a message

**Solution:**

```solidity
// ❌ Hard to debug
require(amount > 0);

// ✅ Easy to debug
require(amount > 0, "Amount must be positive");
```

#### 2. "Invalid signature" errors

**Problem:** Signature format or recovery issues

**Debug steps:**

```solidity
function debugSignature(
    bytes32 messageHash,
    bytes memory signature
) public pure returns (
    uint8 v,
    bytes32 r,
    bytes32 s,
    address recovered
) {
    require(signature.length == 65, "Invalid signature length");

    assembly {
        r := mload(add(signature, 32))
        s := mload(add(signature, 64))
        v := byte(0, mload(add(signature, 96)))
    }

    recovered = ecrecover(messageHash, v, r, s);

    // Debug: Check each component
    require(v == 27 || v == 28, "Invalid v value");
    require(r != 0, "Invalid r value");
    require(s != 0, "Invalid s value");
    require(recovered != address(0), "Recovery failed");
}
```

#### 3. Gas estimation failed

**Problem:** Transaction runs out of gas

**Solution:**

```solidity
// ✅ Add gas limits for expensive operations
function expensiveOperation(uint256 iterations) external {
    require(iterations <= 1000, "Too many iterations");

    uint256 gasStart = gasleft();

    for (uint i = 0; i < iterations; i++) {
        // Expensive work
        if (gasleft() < 10000) {
            revert("Insufficient gas remaining");
        }
    }

    uint256 gasUsed = gasStart - gasleft();
    emit GasUsage(gasUsed);
}

event GasUsage(uint256 gasUsed);
```

#### 4. Testing Your Implementation

```javascript
// Hardhat test example
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CryptographyContracts", function () {
  let hashDemo, signatureDemo;
  let owner, addr1;

  beforeEach(async function () {
    [owner, addr1] = await ethers.getSigners();

    const HashDemo = await ethers.getContractFactory("HashDemo");
    hashDemo = await HashDemo.deploy();

    const SignatureDemo = await ethers.getContractFactory("SignatureDemo");
    signatureDemo = await SignatureDemo.deploy();
  });

  it("Should demonstrate hash properties", async function () {
    const message = "Hello, World!";
    const [hash, , isDeterministic] = await hashDemo.showDeterministicProperty(
      message
    );

    expect(isDeterministic).to.be.true;
    expect(hash).to.not.equal(
      "0x0000000000000000000000000000000000000000000000000000000000000000"
    );
  });

  it("Should verify signatures correctly", async function () {
    const message = "Test message";
    const messageHash = ethers.utils.id(message);
    const signature = await owner.signMessage(message);

    const isValid = await signatureDemo.verifyMessageSignature(
      message,
      signature,
      owner.address
    );

    expect(isValid).to.be.true;
  });
});
```

---

## Real-World Applications

### 1. Ethereum Transaction Verification

```solidity
contract TransactionVerifier {
    struct Transaction {
        address from;
        address to;
        uint256 amount;
        uint256 nonce;
        bytes signature;
    }

    function verifyTransaction(Transaction memory txn)
        public
        pure
        returns (bool isValid)
    {
        // Create transaction hash
        bytes32 txnHash = keccak256(abi.encodePacked(
            txn.from,
            txn.to,
            txn.amount,
            txn.nonce
        ));

        // Verify signature
        return verifySignature(txnHash, txn.signature, txn.from);
    }

    function verifySignature(bytes32 hash, bytes memory sig, address signer)
        internal
        pure
        returns (bool)
    {
        // Implementation details...
        return true; // Simplified
    }
}
```

### 2. Secure Document Verification

```solidity
contract DocumentRegistry {

    mapping(bytes32 => bool) public documentExists;
    mapping(bytes32 => address) public documentOwner;
    mapping(bytes32 => uint256) public documentTimestamp;

    event DocumentRegistered(bytes32 indexed documentHash, address indexed owner);

    function registerDocument(string memory content) external {
        bytes32 documentHash = keccak256(abi.encodePacked(content));

        require(!documentExists[documentHash], "Document already exists");

        documentExists[documentHash] = true;
        documentOwner[documentHash] = msg.sender;
        documentTimestamp[documentHash] = block.timestamp;

        emit DocumentRegistered(documentHash, msg.sender);
    }

    function verifyDocument(string memory content, address claimedOwner)
        external
        view
        returns (bool isValid, uint256 timestamp)
    {
        bytes32 documentHash = keccak256(abi.encodePacked(content));

        isValid = documentExists[documentHash] &&
                  documentOwner[documentHash] == claimedOwner;
        timestamp = documentTimestamp[documentHash];
    }
}
```

---

## Further Resources

### Essential Reading 📚

- [Solidity Documentation](https://docs.soliditylang.org/) - Official Solidity documentation
- [Ethereum.org Cryptography](https://ethereum.org/en/developers/docs/consensus-mechanisms/pos/keys/) - Keys and signatures in Ethereum
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/) - Secure contract implementations

### Development Tools 🛠️

- **Remix IDE:** [https://remix.ethereum.org/](https://remix.ethereum.org/) - Browser-based Solidity IDE
- **Hardhat:** [https://hardhat.org/](https://hardhat.org/) - Ethereum development environment
- **Foundry:** [https://book.getfoundry.sh/](https://book.getfoundry.sh/) - Fast Solidity testing framework
- **OpenZeppelin Wizard:** [https://wizard.openzeppelin.com/](https://wizard.openzeppelin.com/) - Contract generator

### Blockchain-Specific Resources ⛓️

- [Ethereum Improvement Proposals (EIPs)](https://eips.ethereum.org/) - Standards and specifications
- [Consensys Smart Contract Best Practices](https://consensys.github.io/smart-contract-best-practices/) - Security guidelines
- [Solidity Patterns](https://fravoll.github.io/solidity-patterns/) - Common design patterns

### Practice Challenges 🏆

- [Ethernaut](https://ethernaut.openzeppelin.com/) - Smart contract security challenges
- [Capture the Ether](https://capturetheether.com/) - Ethereum security game
- [DamnVulnerableDefi](https://www.damnvulnerabledefi.xyz/) - DeFi security challenges

### Testing and Security 🔒

- [MythX](https://mythx.io/) - Smart contract security analysis
- [Slither](https://github.com/crytic/slither) - Static analysis tool
- [Echidna](https://github.com/crytic/echidna) - Property-based fuzzing

---

**Remember:** Cryptography in Solidity is the foundation that makes smart contracts secure and trustworthy. Master these basics, and you'll understand how digital signatures, transaction verification, and blockchain security work under the hood! 🚀

> 💡 **Connection to ZKPs**: The hash functions and signature schemes you've learned here are the building blocks for Zero Knowledge Proofs. See [ZeroKnowledgeProofs.md](./ZeroKnowledgeProofs.md) for how these concepts enable privacy-preserving protocols!
