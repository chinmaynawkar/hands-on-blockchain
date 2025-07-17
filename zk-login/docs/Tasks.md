# Task List – Password-less ZK Login

| ID  | Task                                                     | Status       | Dependencies |
| --- | -------------------------------------------------------- | ------------ | ------------ |
| T1  | Scaffold repo folders (`zk-login/...`)                   | ✅ completed | —            |
| T2  | Draft `pwd_login.circom` circuit                         | ✅ completed | T1           |
| T3  | Compile circuit, generate r1cs, wasm, zkey, verifierKey  | ✅ completed | T2           |
| T4  | Write JS helper to create commitment during signup       | ✅ completed | T2           |
| T5  | Write JS helper to generate witness & proof during login | ✅ completed | T3           |
| T6  | Express mock server (`/signup`, `/loginData`, `/login`)  | ✅ completed | T4, T5       |
| T7  | Create Vite-React UI (signup & login pages)              | ✅ completed | T4, T5       |
| T8  | Integrate proof workflow into UI                         | ✅ completed | T7           |
| T9  | Basic unit tests (Jest) for circuit & API                | pending      | T3, T6       |
| T10 | Stretch: add TOTP to circuit & UI                        | pending      | T2–T8        |

_Last updated: July 7, 2025_
