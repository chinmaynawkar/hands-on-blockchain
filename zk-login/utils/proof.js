import * as snarkjs from "snarkjs";
import path from "path";

// Paths - different for browser vs Node.js testing
const isNode = typeof window === "undefined";
const WASM_PATH = isNode
  ? path.resolve("keys/pwd_login_js/pwd_login.wasm")
  : "/keys/pwd_login_js/pwd_login.wasm";
const ZKEY_PATH = isNode
  ? path.resolve("keys/pwd_login_0001.zkey")
  : "/keys/pwd_login_0001.zkey";

async function shaToField(password) {
  const enc = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", enc);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const trunc = hashArray.slice(0, 31); // first 31 bytes
  const hex = trunc.map((b) => b.toString(16).padStart(2, "0")).join("");
  return BigInt("0x" + hex);
}

export async function generateProof(password, saltHex, commitmentHex) {
  const pwdField = await shaToField(password);
  const saltField = BigInt("0x" + saltHex);

  // Handle broken commitmentHex format from old data
  let commitmentField;
  try {
    commitmentField = BigInt(commitmentHex);
  } catch (error) {
    console.warn(
      "Invalid commitmentHex format, attempting to fix:",
      commitmentHex
    );

    // Check if it's the broken array format like "0x181,1,226,71,..."
    if (commitmentHex.startsWith("0x") && commitmentHex.includes(",")) {
      // Extract the numeric parts and reconstruct as proper hex
      const numbers = commitmentHex
        .slice(2)
        .split(",")
        .map((n) => parseInt(n.trim()));

      // Convert array of numbers to hex string
      const hexString = numbers
        .map((n) => n.toString(16).padStart(2, "0"))
        .join("");
      commitmentField = BigInt("0x" + hexString);

      console.log("Converted broken format to:", "0x" + hexString);
    } else {
      throw new Error(`Cannot parse commitmentHex: ${commitmentHex}`);
    }
  }

  // prepare input as decimal strings (snarkjs expects strings)
  const input = {
    pwd: pwdField.toString(),
    salt: saltField.toString(),
    C: commitmentField.toString(),
  };

  // Generate proof & public signals
  const { proof, publicSignals } = await snarkjs.groth16.fullProve(
    input,
    WASM_PATH,
    ZKEY_PATH
  );

  return { proof, publicSignals };
}
