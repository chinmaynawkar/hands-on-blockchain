import { describe, test, expect, beforeAll } from "@jest/globals";
import { createCommitment, generateSalt } from "../../utils/commitment.js";
import { buildPoseidon } from "circomlibjs";

describe("Commitment Utils", () => {
  let poseidon;

  beforeAll(async () => {
    poseidon = await buildPoseidon();
  });

  describe("generateSalt", () => {
    test("should generate 32-character hex string", () => {
      const salt = generateSalt();
      expect(typeof salt).toBe("string");
      expect(salt.length).toBe(32); // 16 bytes = 32 hex chars
      expect(/^[0-9a-f]{32}$/.test(salt)).toBe(true);
    });

    test("should generate different salts each time", () => {
      const salt1 = generateSalt();
      const salt2 = generateSalt();
      expect(salt1).not.toBe(salt2);
    });

    test("should not include 0x prefix", () => {
      const salt = generateSalt();
      expect(salt.startsWith("0x")).toBe(false);
    });
  });

  describe("createCommitment", () => {
    test("should create valid commitment for password", async () => {
      const password = "testpassword123";
      const result = await createCommitment(password);

      expect(result).toHaveProperty("saltHex");
      expect(result).toHaveProperty("commitmentHex");
      expect(typeof result.saltHex).toBe("string");
      expect(typeof result.commitmentHex).toBe("string");
      expect(result.saltHex.length).toBe(32);
      expect(result.commitmentHex.startsWith("0x")).toBe(true);
    });

    test("should generate different commitments for different passwords", async () => {
      const result1 = await createCommitment("password1");
      const result2 = await createCommitment("password2");

      expect(result1.commitmentHex).not.toBe(result2.commitmentHex);
    });

    test("should generate same commitment for same password and salt", async () => {
      const password = "testpassword";
      const salt = generateSalt();

      const result1 = await createCommitment(password, salt);
      const result2 = await createCommitment(password, salt);

      expect(result1.commitmentHex).toBe(result2.commitmentHex);
      expect(result1.saltHex).toBe(result2.saltHex);
    });

    test("should generate different commitments for same password with different salts", async () => {
      const password = "testpassword";

      const result1 = await createCommitment(password);
      const result2 = await createCommitment(password);

      expect(result1.commitmentHex).not.toBe(result2.commitmentHex);
      expect(result1.saltHex).not.toBe(result2.saltHex);
    });

    test("should create valid BigInt-compatible hex strings", async () => {
      const result = await createCommitment("testpassword");

      // Should be able to convert to BigInt without error
      expect(() => BigInt(result.commitmentHex)).not.toThrow();
      expect(() => BigInt("0x" + result.saltHex)).not.toThrow();

      // Verify they're valid numbers
      const commitmentBigInt = BigInt(result.commitmentHex);
      const saltBigInt = BigInt("0x" + result.saltHex);

      expect(commitmentBigInt).toBeGreaterThan(0n);
      expect(saltBigInt).toBeGreaterThan(0n);
    });

    test("should handle empty password", async () => {
      const result = await createCommitment("");
      expect(result.commitmentHex).toBeDefined();
      expect(result.saltHex).toBeDefined();
    });

    test("should handle unicode characters", async () => {
      const result = await createCommitment("🔐密码测试");
      expect(result.commitmentHex).toBeDefined();
      expect(result.saltHex).toBeDefined();
      expect(() => BigInt(result.commitmentHex)).not.toThrow();
    });

    test("should handle very long passwords", async () => {
      const longPassword = "a".repeat(1000);
      const result = await createCommitment(longPassword);
      expect(result.commitmentHex).toBeDefined();
      expect(result.saltHex).toBeDefined();
    });
  });

  describe("Integration with Poseidon", () => {
    test("commitment should match manual Poseidon calculation", async () => {
      const password = "testpassword";
      const saltHex = "0123456789abcdef0123456789abcdef";

      const result = await createCommitment(password, saltHex);

      // Manual calculation for verification
      const enc = new TextEncoder().encode(password);
      const hashBuffer = await crypto.subtle.digest("SHA-256", enc);
      const hashArray = Array.from(new Uint8Array(hashBuffer)).slice(0, 31);
      const hex = hashArray
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
      const pwdField = BigInt("0x" + hex);
      const saltField = BigInt("0x" + saltHex);

      const manualCommitment = poseidon([pwdField, saltField]);
      const manualHex =
        "0x" +
        Array.from(manualCommitment)
          .map((byte) => byte.toString(16).padStart(2, "0"))
          .join("");

      expect(result.commitmentHex).toBe(manualHex);
    });
  });
});
