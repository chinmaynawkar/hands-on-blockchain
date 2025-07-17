const snarkjs = require("snarkjs");
const fs = require("fs");
const path = require("path");

async function setupCircuit() {
  console.log("🔧 Setting up Age Verification Circuit...");

  const circuitDir = path.join(__dirname, "..", "public", "circuits");
  const r1csPath = path.join(circuitDir, "age_proof.r1cs");
  const wasmPath = path.join(circuitDir, "age_proof.wasm");

  // Check if circuit files exist
  if (!fs.existsSync(r1csPath)) {
    console.error(
      "❌ Circuit not compiled! Run 'npm run circuit:compile' first"
    );
    process.exit(1);
  }

  try {
    console.log("📦 Starting Powers of Tau ceremony...");

    // Phase 1: Powers of Tau (Universal setup)
    console.log("🌟 Initializing Powers of Tau...");
    await snarkjs.powersOfTau.newAccumulator(
      snarkjs.getCurveFromName("bn128"),
      12, // Power (supports 2^12 = 4096 constraints)
      path.join(circuitDir, "pot12_0000.ptau")
    );

    console.log("🤝 Contributing to Powers of Tau...");
    await snarkjs.powersOfTau.contribute(
      path.join(circuitDir, "pot12_0000.ptau"),
      path.join(circuitDir, "pot12_0001.ptau"),
      "First contribution", // Contributor name
      "entropy_source_12345" // Random entropy
    );

    console.log("🔧 Preparing Phase 2...");
    await snarkjs.powersOfTau.preparePhase2(
      path.join(circuitDir, "pot12_0001.ptau"),
      path.join(circuitDir, "pot12_final.ptau")
    );

    // Phase 2: Circuit-specific setup
    console.log("🎯 Setting up circuit-specific keys...");
    await snarkjs.groth16.setup(
      r1csPath,
      path.join(circuitDir, "pot12_final.ptau"),
      path.join(circuitDir, "age_proof_0000.zkey")
    );

    console.log("🔐 Contributing to circuit setup...");
    await snarkjs.zKey.contribute(
      path.join(circuitDir, "age_proof_0000.zkey"),
      path.join(circuitDir, "age_proof_final.zkey"),
      "First circuit contribution",
      "entropy_circuit_67890"
    );

    console.log("📋 Exporting verification key...");
    const vKey = await snarkjs.zKey.exportVerificationKey(
      path.join(circuitDir, "age_proof_final.zkey")
    );

    fs.writeFileSync(
      path.join(circuitDir, "verification_key.json"),
      JSON.stringify(vKey, null, 2)
    );

    console.log("✅ Circuit setup complete!");
    console.log("📁 Generated files:");
    console.log("  - age_proof_final.zkey (proving key)");
    console.log("  - verification_key.json (verification key)");

    // Cleanup intermediate files
    const filesToCleanup = [
      "pot12_0000.ptau",
      "pot12_0001.ptau",
      "pot12_final.ptau",
      "age_proof_0000.zkey",
    ];

    filesToCleanup.forEach((file) => {
      const filePath = path.join(circuitDir, file);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });
  } catch (error) {
    console.error("❌ Setup failed:", error);
    process.exit(1);
  }
}

if (require.main === module) {
  setupCircuit();
}

module.exports = { setupCircuit };
