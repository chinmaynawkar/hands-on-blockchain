import { describe, test, expect, beforeEach, afterEach } from "@jest/globals";
import request from "supertest";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import fs from "fs";
import path from "path";
import { groth16 } from "snarkjs";
import { createCommitment } from "../../utils/commitment.js";
import { generateProof } from "../../utils/proof.js";

describe("API Endpoints", () => {
  let app;
  let testDbPath;
  let originalEnv;

  beforeEach(() => {
    // Save original environment
    originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "test";

    // Create test database path
    testDbPath = path.resolve("tests/fixtures/test_db.json");

    // Setup Express app (copy from server/index.js but with test modifications)
    app = express();
    app.use(cors());
    app.use(bodyParser.json());

    let db = {};
    function saveDB() {
      fs.writeFileSync(testDbPath, JSON.stringify(db, null, 2));
    }

    // Load test verification key
    const VKEY_PATH = path.resolve("keys/verification_key.json");

    // Signup endpoint
    app.post("/signup", (req, res) => {
      const { email, saltHex, commitmentHex } = req.body;
      if (!email || !saltHex || !commitmentHex) {
        return res.status(400).send("Missing fields");
      }
      db[email] = { saltHex, commitmentHex };
      saveDB();
      res.json({ ok: true });
    });

    // Fetch login data endpoint
    app.get("/loginData", (req, res) => {
      const { email } = req.query;
      const rec = db[email];
      if (!rec) return res.status(404).send("User not found");
      res.json({ ...rec });
    });

    // Login endpoint
    app.post("/login", async (req, res) => {
      const { email, proof, publicSignals } = req.body;
      const rec = db[email];
      if (!rec) return res.status(404).send("User not found");

      if (!fs.existsSync(VKEY_PATH)) {
        return res.status(500).send("Server missing verification key");
      }
      const vKey = JSON.parse(fs.readFileSync(VKEY_PATH));

      try {
        const ok = await groth16.verify(vKey, publicSignals, proof);
        if (!ok) return res.status(401).send("Proof invalid");
        res.json({ token: "test-jwt-token", ok: true });
      } catch (e) {
        console.error(e);
        res.status(500).send("Verification error");
      }
    });
  });

  afterEach(() => {
    // Restore environment
    process.env.NODE_ENV = originalEnv;

    // Clean up test database
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
  });

  describe("POST /signup", () => {
    test("should successfully signup with valid data", async () => {
      const { saltHex, commitmentHex } = await createCommitment("testpassword");

      const response = await request(app).post("/signup").send({
        email: "test@example.com",
        saltHex,
        commitmentHex,
      });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ ok: true });
    });

    test("should reject signup with missing email", async () => {
      const { saltHex, commitmentHex } = await createCommitment("testpassword");

      const response = await request(app).post("/signup").send({
        saltHex,
        commitmentHex,
      });

      expect(response.status).toBe(400);
      expect(response.text).toBe("Missing fields");
    });

    test("should reject signup with missing saltHex", async () => {
      const { commitmentHex } = await createCommitment("testpassword");

      const response = await request(app).post("/signup").send({
        email: "test@example.com",
        commitmentHex,
      });

      expect(response.status).toBe(400);
      expect(response.text).toBe("Missing fields");
    });

    test("should reject signup with missing commitmentHex", async () => {
      const { saltHex } = await createCommitment("testpassword");

      const response = await request(app).post("/signup").send({
        email: "test@example.com",
        saltHex,
      });

      expect(response.status).toBe(400);
      expect(response.text).toBe("Missing fields");
    });

    test("should handle duplicate email signups", async () => {
      const { saltHex, commitmentHex } = await createCommitment("testpassword");

      // First signup
      await request(app).post("/signup").send({
        email: "test@example.com",
        saltHex,
        commitmentHex,
      });

      // Second signup with same email
      const response = await request(app).post("/signup").send({
        email: "test@example.com",
        saltHex: "differentsalt",
        commitmentHex: "differentcommitment",
      });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ ok: true });
    });
  });

  describe("GET /loginData", () => {
    test("should return login data for existing user", async () => {
      const { saltHex, commitmentHex } = await createCommitment("testpassword");

      // First signup
      await request(app).post("/signup").send({
        email: "test@example.com",
        saltHex,
        commitmentHex,
      });

      // Then get login data
      const response = await request(app)
        .get("/loginData")
        .query({ email: "test@example.com" });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        saltHex,
        commitmentHex,
      });
    });

    test("should return 404 for non-existent user", async () => {
      const response = await request(app)
        .get("/loginData")
        .query({ email: "nonexistent@example.com" });

      expect(response.status).toBe(404);
      expect(response.text).toBe("User not found");
    });

    test("should handle missing email parameter", async () => {
      const response = await request(app).get("/loginData");

      expect(response.status).toBe(404);
      expect(response.text).toBe("User not found");
    });
  });

  describe("POST /login", () => {
    let testEmail, testPassword, testSaltHex, testCommitmentHex;

    beforeEach(async () => {
      testEmail = "test@example.com";
      testPassword = "testpassword123";
      const commitment = await createCommitment(testPassword);
      testSaltHex = commitment.saltHex;
      testCommitmentHex = commitment.commitmentHex;

      // Signup the test user
      await request(app).post("/signup").send({
        email: testEmail,
        saltHex: testSaltHex,
        commitmentHex: testCommitmentHex,
      });
    });

    test("should successfully login with valid proof", async () => {
      const { proof, publicSignals } = await generateProof(
        testPassword,
        testSaltHex,
        testCommitmentHex
      );

      const response = await request(app).post("/login").send({
        email: testEmail,
        proof,
        publicSignals,
      });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        token: "test-jwt-token",
        ok: true,
      });
    }, 30000);

    test("should reject login for non-existent user", async () => {
      const { proof, publicSignals } = await generateProof(
        testPassword,
        testSaltHex,
        testCommitmentHex
      );

      const response = await request(app).post("/login").send({
        email: "nonexistent@example.com",
        proof,
        publicSignals,
      });

      expect(response.status).toBe(404);
      expect(response.text).toBe("User not found");
    });

    test("should reject login with invalid proof", async () => {
      const fakeProof = {
        pi_a: ["0", "0", "1"],
        pi_b: [
          ["0", "0"],
          ["0", "0"],
          ["1", "0"],
        ],
        pi_c: ["0", "0", "1"],
        protocol: "groth16",
      };
      const fakePublicSignals = ["0"];

      const response = await request(app).post("/login").send({
        email: testEmail,
        proof: fakeProof,
        publicSignals: fakePublicSignals,
      });

      expect(response.status).toBe(401);
      expect(response.text).toBe("Proof invalid");
    });

    test("should handle missing proof data", async () => {
      const response = await request(app).post("/login").send({
        email: testEmail,
      });

      expect(response.status).toBe(500);
      expect(response.text).toBe("Verification error");
    });
  });

  describe("Error Handling", () => {
    test("should handle malformed JSON", async () => {
      const response = await request(app)
        .post("/signup")
        .set("Content-Type", "application/json")
        .send('{"invalid": json}');

      expect(response.status).toBe(400);
    });

    test("should handle empty request body", async () => {
      const response = await request(app).post("/signup").send({});

      expect(response.status).toBe(400);
      expect(response.text).toBe("Missing fields");
    });
  });
});
