// Helper functions to create Poseidon password commitments for zk-login
// Usage:
//   const { createCommitment } = require('./utils/commitment');
//   const { saltHex, commitmentHex } = await createCommitment("mypassword");

import { buildPoseidon } from "circomlibjs";

let poseidonInstance = null;
async function getPoseidon() {
  if (!poseidonInstance) {
    poseidonInstance = await buildPoseidon();
  }
  return poseidonInstance;
}

/**
 * Generate 128-bit random salt (hex string without 0x prefix).
 */
export function generateSalt() {
  const arr = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(arr)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Convert a UTF-8 password into a field element by hashing with SHA-256
 * and truncating to 248 bits (fits into BabyJub scalar field).
 */
async function passwordToField(password) {
  const enc = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", enc);
  const hashArray = Array.from(new Uint8Array(hashBuffer)).slice(0, 31);
  const hex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  return BigInt("0x" + hex);
}

/**
 * Create Poseidon commitment C = Poseidon(pwdField, saltField).
 * Returns both saltHex (for storage) and commitmentHex (as 0x-prefixed).
 */
export async function createCommitment(password, saltHex = generateSalt()) {
  const pwdField = await passwordToField(password);
  const saltField = BigInt("0x" + saltHex);

  const poseidon = await getPoseidon();
  const commitment = poseidon([pwdField, saltField]);

  // Convert commitment to BigInt properly
  let commitmentBigInt;
  if (typeof commitment === "bigint") {
    commitmentBigInt = commitment;
  } else if (commitment instanceof Uint8Array) {
    // Convert Uint8Array to hex string, then to BigInt
    const hexString = Array.from(commitment)
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");
    commitmentBigInt = BigInt("0x" + hexString);
  } else if (commitment && typeof commitment.toString === "function") {
    // If it's a field element object, convert to string then BigInt
    commitmentBigInt = BigInt(commitment.toString());
  } else {
    throw new Error(
      "Invalid commitment type from Poseidon hash: " + typeof commitment
    );
  }

  const commitmentHex = "0x" + commitmentBigInt.toString(16);

  return { saltHex, commitmentHex };
}
