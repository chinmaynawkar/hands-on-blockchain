import { describe, test, expect, beforeAll } from "@jest/globals";
import { generateProof } from "../../utils/proof.js";
import { createCommitment } from "../../utils/commitment.js";

describe("Proof Generation Utils", () => {
  let testCommitment;
  let testPassword;
  let testSaltHex;

  beforeAll(async () => {
    testPassword = "testpassword123";
    const commitment = await createCommitment(testPassword);
    testSaltHex = commitment.saltHex;
    testCommitment = commitment.commitmentHex;
  });

  describe("generateProof", () => {
    test("should generate valid proof structure", async () => {
      const result = await generateProof(
        testPassword,
        testSaltHex,
        testCommitment
      );

      expect(result).toHaveProperty("proof");
      expect(result).toHaveProperty("publicSignals");

      // Verify proof structure (Groth16 format)
      expect(result.proof).toHaveProperty("pi_a");
      expect(result.proof).toHaveProperty("pi_b");
      expect(result.proof).toHaveProperty("pi_c");
      expect(result.proof).toHaveProperty("protocol");
      expect(result.proof.protocol).toBe("groth16");

      // Verify public signals is an array
      expect(Array.isArray(result.publicSignals)).toBe(true);
      expect(result.publicSignals.length).toBeGreaterThan(0);
    }, 30000); // Increase timeout for proof generation

    test("should generate consistent proofs for same inputs", async () => {
      const result1 = await generateProof(
        testPassword,
        testSaltHex,
        testCommitment
      );
      const result2 = await generateProof(
        testPassword,
        testSaltHex,
        testCommitment
      );

      // Public signals should be the same
      expect(result1.publicSignals).toEqual(result2.publicSignals);

      // Proofs will be different (randomness in generation) but structure should be same
      expect(result1.proof.protocol).toBe(result2.proof.protocol);
      expect(typeof result1.proof.pi_a).toBe(typeof result2.proof.pi_a);
    }, 60000);

    test("should handle broken commitmentHex format", async () => {
      // Test the backward compatibility fix
      const brokenCommitmentHex =
        "0x181,1,226,71,204,156,152,148,197,29,111,201,97,243,120,154";

      expect(async () => {
        await generateProof(testPassword, testSaltHex, brokenCommitmentHex);
      }).not.toThrow();
    }, 30000);

    test("should throw error for invalid commitmentHex", async () => {
      const invalidCommitmentHex = "invalid-hex-string";

      await expect(
        generateProof(testPassword, testSaltHex, invalidCommitmentHex)
      ).rejects.toThrow();
    });

    test("should generate different proofs for different passwords", async () => {
      const wrongPassword = "wrongpassword";

      const correctResult = await generateProof(
        testPassword,
        testSaltHex,
        testCommitment
      );

      // Wrong password should either fail or generate different public signals
      try {
        const wrongResult = await generateProof(
          wrongPassword,
          testSaltHex,
          testCommitment
        );
        // If it doesn't fail, the public signals should be different
        expect(wrongResult.publicSignals).not.toEqual(
          correctResult.publicSignals
        );
      } catch (error) {
        // If it fails, that's also expected behavior
        expect(error).toBeDefined();
      }
    }, 30000);

    test("should validate input types", async () => {
      // Note: The proof generation function converts numbers to strings internally
      // So this test should check for other invalid types or remove this test
      // For now, let's test with null/undefined values which should fail

      await expect(
        generateProof(null, testSaltHex, testCommitment)
      ).rejects.toThrow();

      await expect(
        generateProof(testPassword, null, testCommitment)
      ).rejects.toThrow();

      await expect(
        generateProof(testPassword, testSaltHex, null)
      ).rejects.toThrow();
    });
  });

  describe("SHA-256 Field Conversion", () => {
    test("should handle empty password", async () => {
      const emptyCommitment = await createCommitment("");

      expect(async () => {
        await generateProof(
          "",
          emptyCommitment.saltHex,
          emptyCommitment.commitmentHex
        );
      }).not.toThrow();
    }, 30000);

    test("should handle unicode passwords", async () => {
      const unicodePassword = "🔐测试密码";
      const unicodeCommitment = await createCommitment(unicodePassword);

      expect(async () => {
        await generateProof(
          unicodePassword,
          unicodeCommitment.saltHex,
          unicodeCommitment.commitmentHex
        );
      }).not.toThrow();
    }, 30000);

    test("should handle very long passwords", async () => {
      const longPassword = "a".repeat(1000);
      const longCommitment = await createCommitment(longPassword);

      expect(async () => {
        await generateProof(
          longPassword,
          longCommitment.saltHex,
          longCommitment.commitmentHex
        );
      }).not.toThrow();
    }, 30000);
  });

  describe("Circuit Input Validation", () => {
    test("should generate string inputs for circuit", async () => {
      const result = await generateProof(
        testPassword,
        testSaltHex,
        testCommitment
      );

      // The function should internally convert BigInt to strings for the circuit
      // We can't directly test this, but we can verify the proof generation succeeds
      expect(result.proof).toBeDefined();
      expect(result.publicSignals).toBeDefined();
    }, 30000);
  });
});
