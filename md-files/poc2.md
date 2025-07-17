Tutorial: POC 2 - Building a cWETH Cryptographic Primitive
This tutorial provides a detailed, step-by-step guide to completing the second Proof-of-Concept: implementing the core ElGamal commitment logic of cWETH in a Circom circuit.

Goal: To demystify cWETH's cryptography by building one of its fundamental components. You will see how the complex formulas in the research paper can be constructed by simply wiring together pre-built, audited circuit templates from the circomlib library.

Prerequisites
Before you begin, ensure you have completed the following from the "Environment Setup" phase:

Node.js and Rust installed.

circom and snarkjs installed globally.

The circomlib repository cloned to a known location on your machine. We will assume it's in a folder adjacent to our new project.

/your_workspace
├── /circomlib <-- The cloned repository
└── /poc2_cWETH <-- Our new project folder for this tutorial

Step 1: Understand the Cryptography
The core task is to implement the Twisted ElGamal commitment inside a ZK-SNARK circuit. The formula from the cWETH proposal is:

(C,D)=(r
cdotG,b
cdotG+r
cdotP_K)

Let's break this down:

b: The private balance you want to hide.

r: A private random nonce used to obscure the commitment.

G: The generator point of the BabyJubJub elliptic curve (a publicly known constant).

P_K: The user's public key (a point on the curve).

(C, D): The final commitment, which consists of two new points on the curve.

This formula is built from two basic elliptic curve operations:

Scalar Multiplication: Multiplying a point by a number (e.g., r \* G).

Point Addition: Adding two points together.

circomlib gives us audited components for these exact operations, so we don't have to build them from scratch.

Step 2: Create the Custom Circuit
Now, let's write the Circom code. Inside your /poc2_cWETH directory, create a new file named cWETH_commitment.circom.

Copy the following code into your file. The comments explain each line in detail.

// File: cWETH_commitment.circom
pragma circom 2.0.0;

/\*

- 1.  Import the necessary elliptic curve components from circomlib.
- This gives us access to pre-built templates for curve operations.
- The path should be relative to where you run the circom command.
  \*/
  include "../../circomlib/circuits/babyjub.circom";

/\*

- 2.  Define the circuit template for our ElGamal Commitment.
- This circuit will take private values (balance, nonce) and a public key,
- and output the corresponding public commitment points (C, D).
  \*/
  template ElGamalCommit() {
  // === PRIVATE INPUTS ===
  // These are the secret values known only to the user creating the proof.
  signal private input balance;
  signal private input randomNonce;

      // === PUBLIC INPUTS ===
      // The user's public key, which is a point on the BabyJubJub curve.
      // A point is represented by two coordinates, [x, y].
      signal input publicKey[2];

      // === PUBLIC OUTPUTS ===
      // The resulting commitment, which consists of two points on the curve.
      // This commitment can be made public without revealing the balance.
      signal output commitmentC[2];
      signal output commitmentD[2];


      // === LOGIC: Instantiate circomlib components ===
      // Here, we wire together the pre-built components to perform the calculations.

      // 3. Calculate commitmentC = randomNonce * G
      // We use the ScalarMult component to multiply the curve's generator point (G)
      // by the private randomNonce.
      component commitment_C_calc = ScalarMult(251);
      commitment_C_calc.scalar <== randomNonce;
      commitment_C_calc.point[0] <== BabyJubJub.Generator[0];
      commitment_C_calc.point[1] <== BabyJubJub.Generator[1];

      // 4. Calculate term1_D = balance * G
      // We use another ScalarMult component for this operation.
      component term1_D_calc = ScalarMult(251);
      term1_D_calc.scalar <== balance;
      term1_D_calc.point[0] <== BabyJubJub.Generator[0];
      term1_D_calc.point[1] <== BabyJubJub.Generator[1];

      // 5. Calculate term2_D = randomNonce * publicKey
      // This multiplies the user's public key by the same randomNonce.
      component term2_D_calc = ScalarMult(251);
      term2_D_calc.scalar <== randomNonce;
      term2_D_calc.point[0] <== publicKey[0];
      term2_D_calc.point[1] <== publicKey[1];

      // 6. Calculate commitmentD = term1_D + term2_D
      // We use the Add component to add the two points we just calculated.
      component commitment_D_calc = Add(251);
      commitment_D_calc.p[0] <== term1_D_calc.out[0];
      commitment_D_calc.p[1] <== term1_D_calc.out[1];
      commitment_D_calc.q[0] <== term2_D_calc.out[0];
      commitment_D_calc.q[1] <== term2_D_calc.out[1];

      // 7. Assign the final calculated values to the public outputs.
      commitmentC[0] <== commitment_C_calc.out[0];
      commitmentC[1] <== commitment_C_calc.out[1];
      commitmentD[0] <== commitment_D_calc.out[0];
      commitmentD[1] <== commitment_D_calc.out[1];

  }

// Instantiate the main component of our circuit.
component main = ElGamalCommit();

Step 3: Compile the Circuit and Generate the Witness
Now we will use the circom and snarkjs command-line tools to compile the circuit and test it with some sample data.

Compile the .circom file: This command translates our circuit into a format that snarkjs understands (R1CS and WASM). Run this from your /poc2_cWETH directory.

circom cWETH_commitment.circom --r1cs --wasm --sym

You should now see a cWETH_commitment.r1cs, cWETH_commitment.sym file and a cWETH_commitment_js directory containing generate_witness.js and cWETH_commitment.wasm.

Create an input.json file: This file will contain sample inputs for our circuit. Create a new file named input.json in the same directory.

{
"balance": "100",
"randomNonce": "123456789",
"publicKey": [
"11680998393258431694340893383333363022086955394141653830356828855234033182064",
"438642639102998499772397025134734324317882584788443411891250329248344193186"
]
}

(Note: The public key is a randomly generated valid point on the BabyJubJub curve for demonstration purposes.)

Generate the Witness: The "witness" is the solution to the circuit's constraints for a given set of inputs.

# First, go into the generated JS directory

cd cWETH_commitment_js

# Then, run the witness generator

node generate_witness.js cWETH_commitment.wasm ../input.json ../witness.wtns

# Go back to the parent directory

cd ..

This will create a witness.wtns file in your project's root.

Step 4: Generate and Verify a Proof
This final phase involves creating the proving and verification keys and then using them to generate and check a proof.

Perform Trusted Setup: For a real application, this is a multi-party ceremony. For this POC, we'll use a temporary, single-phase setup (powers of tau).

# 1. Start a new "powers of tau" ceremony

snarkjs powersoftau new bn128 12 pot12_0000.ptau -v

# 2. Contribute to the ceremony (we're the only participant here)

snarkjs powersoftau contribute pot12_0000.ptau pot12_0001.ptau --name="POC Contributor" -v

Generate the .zkey: This file contains the proving and verification keys.

# 1. Start the zkey generation phase

snarkjs plonk setup cWETH_commitment.r1cs pot12_0001.ptau cWETH_commitment_0000.zkey

# 2. Export the verification key to a separate JSON file

snarkjs zkey export verificationkey cWETH_commitment_0000.zkey verification_key.json

Generate the Proof:

snarkjs plonk prove cWETH_commitment_0000.zkey witness.wtns proof.json public.json

This command takes the proving key (.zkey) and the witness, and generates the proof (proof.json) and the public outputs (public.json).

Verify the Proof: This is the moment of truth!

snarkjs plonk verify verification_key.json public.json proof.json

If everything was successful, you will see the following output:
[INFO] snarkJS: OK!

Learning Outcome
Congratulations! You have successfully:

Translated a complex cryptographic formula from a research paper into a working Circom circuit.

Leveraged the Iden3 circomlib library to handle the low-level elliptic curve math.

Compiled a circuit, generated a witness, and created a valid ZK-SNARK proof.

Verified the proof, confirming that your circuit correctly implements the cWETH commitment logic.

You now have a tangible understanding of how to build the cryptographic primitives for cWETH and are well-equipped to tackle the full deposit, transfer, and withdraw circuits.
