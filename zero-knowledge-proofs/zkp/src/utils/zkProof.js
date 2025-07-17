// Real ZK Proof utilities using SnarkJS and Circom
import * as snarkjs from "snarkjs";

/**
 * Load circuit files (WASM and zkey)
 */
export async function loadCircuit() {
  try {
    const wasmResponse = await fetch("/circuits/age_proof.wasm");
    const zkeyResponse = await fetch("/circuits/age_proof_final.zkey");

    if (!wasmResponse.ok || !zkeyResponse.ok) {
      throw new Error(
        "Circuit files not found. Run 'npm run circuit:setup' first."
      );
    }

    const wasmBuffer = await wasmResponse.arrayBuffer();
    const zkeyBuffer = await zkeyResponse.arrayBuffer();

    return {
      wasm: new Uint8Array(wasmBuffer),
      zkey: new Uint8Array(zkeyBuffer),
    };
  } catch (error) {
    console.error("Failed to load circuit:", error);
    throw error;
  }
}

/**
 * Load verification key
 */
export async function loadVerificationKey() {
  try {
    const response = await fetch("/circuits/verification_key.json");
    if (!response.ok) {
      throw new Error("Verification key not found");
    }
    return await response.json();
  } catch (error) {
    console.error("Failed to load verification key:", error);
    throw error;
  }
}

/**
 * Generate inputs for the age verification circuit
 */
export function generateCircuitInputs(birthDate, userAddress) {
  // Convert birth date to timestamp (seconds since epoch)
  const doBTimestamp = Math.floor(new Date(birthDate).getTime() / 1000);
  const currentTimestamp = Math.floor(Date.now() / 1000);

  // Age threshold: 18 years in seconds
  const ageThreshold = 18 * 365.25 * 24 * 3600;

  // Check if user is actually over 18
  const actualAge = currentTimestamp - doBTimestamp;
  if (actualAge < ageThreshold) {
    throw new Error("User is under 18 years old");
  }

  // For browser environment, we'll use a simplified hash
  // In a real implementation, this would use the Poseidon hash from circomlib
  const addressBigInt = BigInt(userAddress);
  const hash = addressBigInt + BigInt(doBTimestamp); // Simplified hash for demo

  return {
    doBTimestamp: doBTimestamp.toString(),
    address: addressBigInt.toString(),
    currentTimestamp: currentTimestamp.toString(),
    ageThreshold: Math.floor(ageThreshold).toString(),
    hash: hash.toString(),
  };
}

/**
 * Generate ZK proof using SnarkJS
 */
export async function generateProof(inputs, circuitFiles) {
  try {
    console.log("🧮 Computing witness and generating proof...");

    // Create blob URLs for the circuit files
    const wasmBlob = new Blob([circuitFiles.wasm], {
      type: "application/wasm",
    });
    const zkeyBlob = new Blob([circuitFiles.zkey], {
      type: "application/octet-stream",
    });

    const wasmUrl = URL.createObjectURL(wasmBlob);
    const zkeyUrl = URL.createObjectURL(zkeyBlob);

    // Generate proof using SnarkJS
    const { proof, publicSignals } = await snarkjs.groth16.fullProve(
      inputs,
      wasmUrl,
      zkeyUrl
    );

    // Cleanup blob URLs
    URL.revokeObjectURL(wasmUrl);
    URL.revokeObjectURL(zkeyUrl);

    console.log("✅ Proof generated successfully!");
    return { proof, publicSignals };
  } catch (error) {
    console.error("❌ Proof generation failed:", error);
    throw error;
  }
}

/**
 * Verify ZK proof using SnarkJS
 */
export async function verifyProof(proof, publicSignals, verificationKey) {
  try {
    console.log("🔍 Verifying proof...");

    const isValid = await snarkjs.groth16.verify(
      verificationKey,
      publicSignals,
      proof
    );

    if (isValid) {
      console.log("✅ Proof verification successful!");
    } else {
      console.log("❌ Proof verification failed!");
    }

    return isValid;
  } catch (error) {
    console.error("❌ Verification error:", error);
    return false;
  }
}

/**
 * Parse and display public signals in a human-readable format
 */
export function parsePublicSignals(publicSignals) {
  if (!publicSignals || publicSignals.length < 4) {
    throw new Error("Invalid public signals");
  }

  const address = publicSignals[0];
  const currentTimestamp = parseInt(publicSignals[1]);
  const ageThreshold = parseInt(publicSignals[2]);
  const hash = publicSignals[3];

  const currentDate = new Date(currentTimestamp * 1000);
  const thresholdYears = ageThreshold / (365.25 * 24 * 3600);

  return {
    address,
    currentTimestamp,
    currentDate: currentDate.toISOString(),
    ageThreshold,
    thresholdYears: Math.round(thresholdYears * 10) / 10,
    hash,
    summary: `User is at least ${thresholdYears} years old (verified at ${currentDate.toLocaleDateString()})`,
  };
}

/**
 * Check if circuit files are available
 */
export async function checkCircuitAvailability() {
  try {
    const wasmResponse = await fetch("/circuits/age_proof.wasm", {
      method: "HEAD",
    });
    const zkeyResponse = await fetch("/circuits/age_proof_final.zkey", {
      method: "HEAD",
    });
    const vkeyResponse = await fetch("/circuits/verification_key.json", {
      method: "HEAD",
    });

    return {
      wasm: wasmResponse.ok,
      zkey: zkeyResponse.ok,
      vkey: vkeyResponse.ok,
      ready: wasmResponse.ok && zkeyResponse.ok && vkeyResponse.ok,
    };
  } catch (error) {
    return {
      wasm: false,
      zkey: false,
      vkey: false,
      ready: false,
      error: error.message,
    };
  }
}
