import { randomBytes } from "crypto";

// BabyJubJub curve parameters
const BABYJUBJUB_PARAMS = {
  // Prime field modulus (BN254 scalar field)
  p: BigInt(
    "21888242871839275222246405745257275088548364400416034343698204186575808495617"
  ),
  // Curve order
  order: BigInt(
    "2736030358979909402780800718157159386076813972158567259200215660948447373041"
  ),
  // Edwards curve parameter d
  d: BigInt(
    "9706598848417545097372247223557719406784115219466060233080913168975159366771"
  ),
  // Generator point
  generator: {
    x: BigInt(
      "5299619240641551281634865583518297030282874472190772894086521144482721001553"
    ),
    y: BigInt(
      "16950150798460657717958625567821834550301663161624707787222815936182638968203"
    ),
  },
};

/**
 * Generate a cryptographically secure random private key
 */
function generatePrivateKey() {
  const keyBytes = new Uint8Array(32);

  // Use crypto.getRandomValues if available (browser), otherwise use Node.js crypto
  if (
    typeof window !== "undefined" &&
    window.crypto &&
    window.crypto.getRandomValues
  ) {
    window.crypto.getRandomValues(keyBytes);
  } else if (typeof require !== "undefined") {
    const crypto = require("crypto");
    const randomBytesArray = crypto.randomBytes(32);
    keyBytes.set(randomBytesArray);
  } else {
    // Fallback: use Math.random (not cryptographically secure)
    console.warn(
      "Using Math.random for key generation - not cryptographically secure!"
    );
    for (let i = 0; i < 32; i++) {
      keyBytes[i] = Math.floor(Math.random() * 256);
    }
  }

  // Convert to BigInt and ensure it's within the curve order
  let privateKey = BigInt(0);
  for (let i = 0; i < 32; i++) {
    privateKey = privateKey << BigInt(8);
    privateKey = privateKey | BigInt(keyBytes[i]);
  }

  // Ensure private key is less than curve order
  privateKey = privateKey % BABYJUBJUB_PARAMS.order;

  // Ensure private key is not zero
  if (privateKey === BigInt(0)) {
    privateKey = BigInt(1);
  }

  return privateKey.toString(16).padStart(64, "0");
}

/**
 * Point addition on BabyJubJub Edwards curve
 */
function pointAdd(p1, p2) {
  const { x: x1, y: y1 } = p1;
  const { x: x2, y: y2 } = p2;
  const { d, p } = BABYJUBJUB_PARAMS;

  const lambda = (d * x1 * x2 * y1 * y2) % p;

  const x3Num = (x1 * y2 + y1 * x2) % p;
  const x3Den = (BigInt(1) + lambda) % p;
  const x3 = (x3Num * modInverse(x3Den, p)) % p;

  const y3Num = (y1 * y2 - x1 * x2) % p;
  const y3Den = (BigInt(1) - lambda) % p;
  const y3 = (y3Num * modInverse(y3Den, p)) % p;

  return {
    x: x3 < 0 ? x3 + p : x3,
    y: y3 < 0 ? y3 + p : y3,
  };
}

/**
 * Point doubling on BabyJubJub Edwards curve
 */
function pointDouble(point) {
  return pointAdd(point, point);
}

/**
 * Scalar multiplication on BabyJubJub curve
 */
function scalarMult(scalar, point) {
  if (scalar === BigInt(0)) {
    return { x: BigInt(0), y: BigInt(1) }; // Point at infinity
  }

  let result = { x: BigInt(0), y: BigInt(1) }; // Point at infinity
  let addend = point;

  while (scalar > BigInt(0)) {
    if (scalar & BigInt(1)) {
      result = pointAdd(result, addend);
    }
    addend = pointDouble(addend);
    scalar = scalar >> BigInt(1);
  }

  return result;
}

/**
 * Modular inverse using extended Euclidean algorithm
 */
function modInverse(a, m) {
  if (a < 0) a = a + m;

  const originalM = m;
  let x1 = BigInt(1);
  let x2 = BigInt(0);

  if (m === BigInt(1)) return BigInt(0);

  while (a > BigInt(1)) {
    const q = a / m;
    let t = m;

    m = a % m;
    a = t;
    t = x2;

    x2 = x1 - q * x2;
    x1 = t;
  }

  if (x1 < 0) x1 = x1 + originalM;

  return x1;
}

/**
 * Generate BabyJubJub keypair
 */
export async function generateBabyJubJubKeys() {
  try {
    const privateKey = generatePrivateKey();
    const privateKeyBigInt = BigInt("0x" + privateKey);

    // Generate public key by multiplying generator point by private key
    const publicKeyPoint = scalarMult(
      privateKeyBigInt,
      BABYJUBJUB_PARAMS.generator
    );

    return {
      privateKey,
      publicKey: {
        x: publicKeyPoint.x.toString(16).padStart(64, "0"),
        y: publicKeyPoint.y.toString(16).padStart(64, "0"),
      },
      curve: "BabyJubJub",
      timestamp: Date.now(),
    };
  } catch (error) {
    throw new Error(`Key generation failed: ${error.message}`);
  }
}

/**
 * Validate BabyJubJub keys
 */
export async function validateKeys(keyPair) {
  try {
    if (!keyPair || !keyPair.privateKey || !keyPair.publicKey) {
      return false;
    }

    const { privateKey, publicKey } = keyPair;

    // Validate private key format
    if (!/^[0-9a-fA-F]{64}$/.test(privateKey)) {
      return false;
    }

    // Validate public key format
    if (
      !/^[0-9a-fA-F]{64}$/.test(publicKey.x) ||
      !/^[0-9a-fA-F]{64}$/.test(publicKey.y)
    ) {
      return false;
    }

    // Convert to BigInt
    const privKeyBigInt = BigInt("0x" + privateKey);
    const pubKeyX = BigInt("0x" + publicKey.x);
    const pubKeyY = BigInt("0x" + publicKey.y);

    // Validate private key is within curve order
    if (
      privKeyBigInt >= BABYJUBJUB_PARAMS.order ||
      privKeyBigInt === BigInt(0)
    ) {
      return false;
    }

    // Validate public key is on curve
    const { d, p } = BABYJUBJUB_PARAMS;
    const lhs = (pubKeyX * pubKeyX + pubKeyY * pubKeyY) % p;
    const rhs = (BigInt(1) + d * pubKeyX * pubKeyX * pubKeyY * pubKeyY) % p;

    if (lhs !== rhs) {
      return false;
    }

    // Verify public key matches private key
    const derivedPublicKey = scalarMult(
      privKeyBigInt,
      BABYJUBJUB_PARAMS.generator
    );

    return derivedPublicKey.x === pubKeyX && derivedPublicKey.y === pubKeyY;
  } catch (error) {
    console.error("Key validation error:", error);
    return false;
  }
}

/**
 * Hash function using browser's SubtleCrypto API
 */
export async function hash(message) {
  if (typeof window !== "undefined" && window.crypto && window.crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    const hashBuffer = await window.crypto.subtle.digest("SHA-256", data);
    const hashArray = new Uint8Array(hashBuffer);
    return Array.from(hashArray)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  } else {
    // Fallback for Node.js environment
    const crypto = require("crypto");
    return crypto.createHash("sha256").update(message).digest("hex");
  }
}

/**
 * Generate commitment for age proof
 */
export async function generateCommitment(birthDate, nonce) {
  const message = `${birthDate.year}-${birthDate.month}-${birthDate.day}-${nonce}`;
  return await hash(message);
}

/**
 * Calculate age from birth date
 */
export function calculateAge(birthDate) {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;
  const currentDay = today.getDate();

  let age = currentYear - birthDate.year;

  // Adjust if birthday hasn't occurred this year
  if (
    currentMonth < birthDate.month ||
    (currentMonth === birthDate.month && currentDay < birthDate.day)
  ) {
    age--;
  }

  return age;
}
