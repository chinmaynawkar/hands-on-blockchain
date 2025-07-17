const snarkjs = require("snarkjs");
const fs = require("fs");
const path = require("path");

async function verifyAgeProof() {
  console.log("🔍 Verifying Age Proof...");

  const circuitDir = path.join(__dirname, "..", "public", "circuits");
  const vkeyPath = path.join(circuitDir, "verification_key.json");
  const proofPath = path.join(circuitDir, "age_proof.json");
  const publicPath = path.join(circuitDir, "public_signals.json");

  // Check if all files exist
  const requiredFiles = [vkeyPath, proofPath, publicPath];
  for (const file of requiredFiles) {
    if (!fs.existsSync(file)) {
      console.error(`❌ Missing file: ${file}`);
      console.error("Run proof generation first: npm run circuit:prove");
      process.exit(1);
    }
  }

  try {
    // Load verification key, proof, and public signals
    const vKey = JSON.parse(fs.readFileSync(vkeyPath));
    const proof = JSON.parse(fs.readFileSync(proofPath));
    const publicSignals = JSON.parse(fs.readFileSync(publicPath));

    console.log("📋 Verification Key loaded");
    console.log("🎭 Proof loaded");
    console.log("📊 Public signals loaded");

    console.log("\n📊 Public Signals:");
    console.log(`  Address: ${publicSignals[0]}`);
    console.log(`  Current Timestamp: ${publicSignals[1]}`);
    console.log(`  Age Threshold: ${publicSignals[2]}`);
    console.log(`  Hash: ${publicSignals[3]}`);

    // Verify the proof
    console.log("\n🔍 Verifying proof...");
    const isValid = await snarkjs.groth16.verify(vKey, publicSignals, proof);

    if (isValid) {
      console.log("✅ PROOF VERIFICATION SUCCESSFUL!");
      console.log(
        "🎉 The user has proven they are over 18 without revealing their exact age!"
      );

      // Calculate and display age information (for demonstration)
      const currentTimestamp = parseInt(publicSignals[1]);
      const ageThreshold = parseInt(publicSignals[2]);

      const currentDate = new Date(currentTimestamp * 1000);
      const thresholdYears = ageThreshold / (365.25 * 24 * 3600);

      console.log(`\n📅 Verification Details:`);
      console.log(`  ✓ User is at least ${thresholdYears} years old`);
      console.log(`  ✓ Verified at: ${currentDate.toISOString()}`);
      console.log(`  ✓ Address authenticated via Poseidon hash`);
      console.log(`  ✓ No personal information revealed`);
    } else {
      console.log("❌ PROOF VERIFICATION FAILED!");
      console.log("🚫 The proof is invalid or tampered with.");
    }

    return isValid;
  } catch (error) {
    console.error("❌ Verification failed:", error);
    return false;
  }
}

// Generate Solidity verifier (bonus feature)
async function generateSolidityVerifier() {
  console.log("\n🔧 Generating Solidity verifier contract...");

  const circuitDir = path.join(__dirname, "..", "public", "circuits");
  const zkeyPath = path.join(circuitDir, "age_proof_final.zkey");
  const verifierPath = path.join(circuitDir, "AgeVerifier.sol");

  if (!fs.existsSync(zkeyPath)) {
    console.error("❌ zkey file missing! Run setup first.");
    return;
  }

  try {
    const verifierCode = await snarkjs.zKey.exportSolidityVerifier(zkeyPath);
    fs.writeFileSync(verifierPath, verifierCode);
    console.log(`✅ Solidity verifier saved to: ${verifierPath}`);
    console.log(
      "🚀 You can now deploy this contract to verify proofs on-chain!"
    );
  } catch (error) {
    console.error("❌ Failed to generate Solidity verifier:", error);
  }
}

// Main execution
if (require.main === module) {
  verifyAgeProof()
    .then(async (isValid) => {
      if (isValid && process.argv.includes("--solidity")) {
        await generateSolidityVerifier();
      }
      process.exit(isValid ? 0 : 1);
    })
    .catch(console.error);
}

module.exports = { verifyAgeProof, generateSolidityVerifier };
