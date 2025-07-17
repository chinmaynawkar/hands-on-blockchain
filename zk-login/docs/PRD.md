# Password-less Zero-Knowledge Login (ZK-Auth)

## Problem Statement

Conventional password systems expose user credentials during transmission and storage, leading to constant data-breach headlines. Users dislike cumbersome 2FA, while site operators fear liability for stored hashes.

## Solution Overview

Use a succinct zero-knowledge proof so a user can demonstrate knowledge of their password **without revealing it**. The server stores only a Poseidon commitment (`pwdHash`) and verifies a Groth16 proof during login.

## Objectives / Success Metrics

- < 250 constraints total (fast browser proving)
- Signup < 1 s in Chrome on a 2020 laptop
- Login proof generation ≤ 2 s, verification ≤ 50 ms
- No password or salt ever leaves the user's browser in plaintext
- Demo works completely offline with a mock JSON "database"

## Key Features

1. **Password Commitment** – Poseidon hash of `(password, salt)` stored server-side.
2. **ZK Login Proof** – Circuit enforces `Poseidon(pwd,salt) == commitment`.
3. **Optional Email Binding** – Prove that the email entered hashes to the stored `emailHash`.
4. **JWT Session** – Server issues JWT after successful proof.
5. **Stretch: TOTP 2FA** – Include a 6-digit TOTP code in the witness.

## User Stories

### 1 Signup

1. User enters email + password.
2. Browser generates `salt`, computes commitment.
3. Browser sends `{ email, salt, commitment }` to server.
4. Server stores record in JSON DB.

### 2 Login

1. User enters email + password.
2. Browser fetches `{ salt, commitment }` for email.
3. Browser generates witness `(password, salt)` and Groth16 proof.
4. Browser POSTs `{ proof, publicSignals }` to `/login`.
5. Server verifies and returns JWT.

## Non-Goals / Out of Scope

- Production-grade key management
- Rate-limiting, captcha, or phishing prevention
- Multi-device sync of the password commitment
