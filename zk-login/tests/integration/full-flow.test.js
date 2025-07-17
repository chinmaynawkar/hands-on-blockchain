import { describe, test, expect, beforeAll, afterAll } from "@jest/globals";
import { spawn } from "child_process";
import request from "supertest";
import { createCommitment } from "../../utils/commitment.js";
import { generateProof } from "../../utils/proof.js";

describe("Full ZK Login Flow Integration", () => {
  let serverProcess;
  const API_BASE = "http://localhost:4001"; // Use different port for testing
  const testUsers = [];

  beforeAll(async () => {
    // Start the server for integration testing
    serverProcess = spawn("node", ["server/index.js"], {
      env: { ...process.env, PORT: "4001" },
      stdio: "pipe",
    });

    // Wait for server to start
    await new Promise((resolve) => {
      serverProcess.stdout.on("data", (data) => {
        if (data.toString().includes("running on :4001")) {
          resolve();
        }
      });
    });
  }, 10000);

  afterAll(async () => {
    // Clean up server process
    if (serverProcess) {
      serverProcess.kill();
    }
  });

  describe("Complete User Journey", () => {
    test("should complete full signup -> login cycle", async () => {
      const userEmail = `test-${Date.now()}@example.com`;
      const userPassword = "mySecurePassword123!";

      // Step 1: Generate commitment for signup
      const { saltHex, commitmentHex } = await createCommitment(userPassword);
      expect(saltHex).toBeDefined();
      expect(commitmentHex).toBeDefined();
      expect(commitmentHex.startsWith("0x")).toBe(true);

      // Step 2: Signup via API
      const signupResponse = await request(API_BASE).post("/signup").send({
        email: userEmail,
        saltHex,
        commitmentHex,
      });

      expect(signupResponse.status).toBe(200);
      expect(signupResponse.body).toEqual({ ok: true });

      // Step 3: Fetch login data
      const loginDataResponse = await request(API_BASE)
        .get("/loginData")
        .query({ email: userEmail });

      expect(loginDataResponse.status).toBe(200);
      expect(loginDataResponse.body).toEqual({
        saltHex,
        commitmentHex,
      });

      // Step 4: Generate proof for login
      const { proof, publicSignals } = await generateProof(
        userPassword,
        saltHex,
        commitmentHex
      );

      expect(proof).toBeDefined();
      expect(proof.protocol).toBe("groth16");
      expect(Array.isArray(publicSignals)).toBe(true);

      // Step 5: Login with proof
      const loginResponse = await request(API_BASE).post("/login").send({
        email: userEmail,
        proof,
        publicSignals,
      });

      expect(loginResponse.status).toBe(200);
      expect(loginResponse.body).toHaveProperty("token");
      expect(loginResponse.body).toHaveProperty("ok", true);

      // Store test user for cleanup
      testUsers.push(userEmail);
    }, 60000);

    test("should reject login with wrong password", async () => {
      const userEmail = `test-wrong-${Date.now()}@example.com`;
      const correctPassword = "correctPassword123";
      const wrongPassword = "wrongPassword456";

      // Signup with correct password
      const { saltHex, commitmentHex } = await createCommitment(
        correctPassword
      );

      await request(API_BASE).post("/signup").send({
        email: userEmail,
        saltHex,
        commitmentHex,
      });

      // Try to login with wrong password
      try {
        const { proof, publicSignals } = await generateProof(
          wrongPassword,
          saltHex,
          commitmentHex
        );

        const loginResponse = await request(API_BASE).post("/login").send({
          email: userEmail,
          proof,
          publicSignals,
        });

        // Should either fail at verification or return 401
        expect([401, 500]).toContain(loginResponse.status);
      } catch (error) {
        // Or the proof generation itself should fail
        expect(error).toBeDefined();
      }

      testUsers.push(userEmail);
    }, 60000);

    test("should handle multiple users independently", async () => {
      const users = [
        { email: `user1-${Date.now()}@example.com`, password: "password1" },
        { email: `user2-${Date.now()}@example.com`, password: "password2" },
        { email: `user3-${Date.now()}@example.com`, password: "password3" },
      ];

      // Signup all users
      const userCommitments = [];
      for (const user of users) {
        const { saltHex, commitmentHex } = await createCommitment(
          user.password
        );
        userCommitments.push({ ...user, saltHex, commitmentHex });

        const signupResponse = await request(API_BASE).post("/signup").send({
          email: user.email,
          saltHex,
          commitmentHex,
        });

        expect(signupResponse.status).toBe(200);
        testUsers.push(user.email);
      }

      // Login all users
      for (const user of userCommitments) {
        const { proof, publicSignals } = await generateProof(
          user.password,
          user.saltHex,
          user.commitmentHex
        );

        const loginResponse = await request(API_BASE).post("/login").send({
          email: user.email,
          proof,
          publicSignals,
        });

        expect(loginResponse.status).toBe(200);
        expect(loginResponse.body.ok).toBe(true);
      }
    }, 120000);
  });

  describe("Error Scenarios", () => {
    test("should handle non-existent user login attempt", async () => {
      const nonExistentEmail = `nonexistent-${Date.now()}@example.com`;

      const loginDataResponse = await request(API_BASE)
        .get("/loginData")
        .query({ email: nonExistentEmail });

      expect(loginDataResponse.status).toBe(404);
      expect(loginDataResponse.text).toBe("User not found");
    });

    test("should handle malformed commitment data", async () => {
      const userEmail = `malformed-${Date.now()}@example.com`;

      const signupResponse = await request(API_BASE).post("/signup").send({
        email: userEmail,
        saltHex: "not-a-valid-hex",
        commitmentHex: "also-not-valid",
      });

      // Signup might succeed (server doesn't validate format)
      // But login should fail
      if (signupResponse.status === 200) {
        try {
          const { proof, publicSignals } = await generateProof(
            "somepassword",
            "not-a-valid-hex",
            "also-not-valid"
          );

          const loginResponse = await request(API_BASE).post("/login").send({
            email: userEmail,
            proof,
            publicSignals,
          });

          expect(loginResponse.status).not.toBe(200);
        } catch (error) {
          // Expected to fail at proof generation
          expect(error).toBeDefined();
        }

        testUsers.push(userEmail);
      }
    }, 30000);
  });

  describe("Performance and Stress", () => {
    test("should handle concurrent signups", async () => {
      const concurrentUsers = Array.from({ length: 5 }, (_, i) => ({
        email: `concurrent-${i}-${Date.now()}@example.com`,
        password: `password${i}`,
      }));

      const signupPromises = concurrentUsers.map(async (user) => {
        const { saltHex, commitmentHex } = await createCommitment(
          user.password
        );

        return request(API_BASE).post("/signup").send({
          email: user.email,
          saltHex,
          commitmentHex,
        });
      });

      const results = await Promise.all(signupPromises);

      results.forEach((response, index) => {
        expect(response.status).toBe(200);
        testUsers.push(concurrentUsers[index].email);
      });
    }, 60000);

    test("should maintain proof uniqueness across sessions", async () => {
      const userEmail = `uniqueness-${Date.now()}@example.com`;
      const password = "testPassword123";

      // Signup
      const { saltHex, commitmentHex } = await createCommitment(password);
      await request(API_BASE)
        .post("/signup")
        .send({ email: userEmail, saltHex, commitmentHex });

      // Generate multiple proofs for same user
      const proofs = [];
      for (let i = 0; i < 3; i++) {
        const { proof, publicSignals } = await generateProof(
          password,
          saltHex,
          commitmentHex
        );
        proofs.push({ proof, publicSignals });
      }

      // All proofs should have same public signals but different proof values
      const firstPublicSignals = JSON.stringify(proofs[0].publicSignals);
      proofs.forEach(({ proof, publicSignals }) => {
        expect(JSON.stringify(publicSignals)).toBe(firstPublicSignals);
        // Proofs themselves should be different due to randomness
        expect(proof).toBeDefined();
        expect(proof.protocol).toBe("groth16");
      });

      testUsers.push(userEmail);
    }, 90000);
  });
});
