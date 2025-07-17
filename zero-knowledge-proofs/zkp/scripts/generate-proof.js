const snarkjs = require("snarkjs");
const fs = require("fs");
const path = require("path");
const { poseidon } = require("circomlib");

async function generateAgeProof(birthDate, userAddress) {
  console.log("🔍 Generating Age Verification Proof...");

  const circuitDir = path.join(__dirname, "..", "public", "circuits");
  const wasmPath = path.join(circuitDir, "age_proof.wasm");
  const zkeyPath = path.join(circuitDir, "age_proof_final.zkey");

  if (!fs.existsSync(wasmPath) || !fs.existsSync(zkeyPath)) {
    console.error("❌ Circuit files missing! Run setup first:");
    console.error("  npm run circuit:compile");
    console.error("  npm run circuit:setup");
    process.exit(1);
  }

  try {
    // Convert birth date to timestamp (seconds since epoch)
    const doBTimestamp = Math.floor(new Date(birthDate).getTime() / 1000);
    const currentTimestamp = Math.floor(Date.now() / 1000);

    // Age threshold: 18 years in seconds (18 * 365.25 * 24 * 3600)
    const ageThreshold = 18 * 365.25 * 24 * 3600;

    // Calculate actual age in seconds
    const actualAge = currentTimestamp - doBTimestamp;

    console.log(`📅 Birth Date: ${birthDate}`);
    console.log(`👤 User Address: ${userAddress}`);
    console.log(
      `⏰ Current Age: ${(actualAge / (365.25 * 24 * 3600)).toFixed(1)} years`
    );
    console.log(
      `🎯 Threshold: ${(ageThreshold / (365.25 * 24 * 3600)).toFixed(1)} years`
    );

    if (actualAge < ageThreshold) {
      console.error("❌ User is under 18! Cannot generate valid proof.");
      process.exit(1);
    }

    // Generate Poseidon hash of address and DoB
    const addressBigInt = BigInt(userAddress);
    const hash = poseidon([addressBigInt, BigInt(doBTimestamp)]);

    // Circuit inputs
    const input = {
      doBTimestamp: doBTimestamp.toString(),
      address: addressBigInt.toString(),
      currentTimestamp: currentTimestamp.toString(),
      ageThreshold: Math.floor(ageThreshold).toString(),
      hash: hash.toString(),
    };

    console.log("🧮 Computing witness...");
    const { witness } = await snarkjs.groth16.fullProve(
      input,
      wasmPath,
      zkeyPath
    );

    console.log("🎭 Generating proof...");
    const { proof, publicSignals } = await snarkjs.groth16.prove(
      zkeyPath,
      witness
    );

    // Save proof and public signals
    const proofPath = path.join(circuitDir, "age_proof.json");
    const publicPath = path.join(circuitDir, "public_signals.json");

    fs.writeFileSync(proofPath, JSON.stringify(proof, null, 2));
    fs.writeFileSync(publicPath, JSON.stringify(publicSignals, null, 2));

    console.log("✅ Proof generated successfully!");
    console.log(`📁 Proof saved to: ${proofPath}`);
    console.log(`📁 Public signals saved to: ${publicPath}`);

    console.log("\n📊 Public Signals:");
    console.log(`  Address: ${publicSignals[0]}`);
    console.log(`  Current Timestamp: ${publicSignals[1]}`);
    console.log(`  Age Threshold: ${publicSignals[2]}`);
    console.log(`  Hash: ${publicSignals[3]}`);

    return { proof, publicSignals };
  } catch (error) {
    console.error("❌ Proof generation failed:", error);
    throw error;
  }
}

// Example usage
if (require.main === module) {
  const birthDate = process.argv[2] || "1990-05-15"; // Default test date
  const userAddress =
    process.argv[3] || "0x742fA5C4fEf5fa3c0A8cB3e6BC6e2b28Dd82eB58"; // Default test address

  generateAgeProof(birthDate, userAddress)
    .then(() => console.log("🎉 Complete!"))
    .catch(console.error);
}

module.exports = { generateAgeProof };
