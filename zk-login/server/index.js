import fs from "fs";
import path from "path";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { groth16 } from "snarkjs";

const PORT = process.env.PORT || 4000;
const DB_PATH = path.resolve("server/db.json");
const VKEY_PATH = path.resolve("keys/verification_key.json");

// Load or init DB
let db = {};
if (fs.existsSync(DB_PATH)) {
  db = JSON.parse(fs.readFileSync(DB_PATH));
}
function saveDB() {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Signup
app.post("/signup", (req, res) => {
  const { email, saltHex, commitmentHex } = req.body;
  if (!email || !saltHex || !commitmentHex)
    return res.status(400).send("Missing fields");
  db[email] = { saltHex, commitmentHex };
  saveDB();
  res.json({ ok: true });
});

// Fetch login data
app.get("/loginData", (req, res) => {
  const { email } = req.query;
  const rec = db[email];
  if (!rec) return res.status(404).send("User not found");
  res.json({ ...rec });
});

// Login – verify proof
app.post("/login", async (req, res) => {
  const { email, proof, publicSignals } = req.body;
  const rec = db[email];
  if (!rec) return res.status(404).send("User not found");

  // Load verification key
  if (!fs.existsSync(VKEY_PATH))
    return res.status(500).send("Server missing verification key");
  const vKey = JSON.parse(fs.readFileSync(VKEY_PATH));

  try {
    const ok = await groth16.verify(vKey, publicSignals, proof);
    if (!ok) return res.status(401).send("Proof invalid");

    // dummy JWT
    res.json({ token: "dummy-jwt", ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).send("Verification error");
  }
});

app.listen(PORT, () => console.log(`ZK-Login mock server running on :${PORT}`));
