pragma circom 2.1.4;

include "circomlib/circuits/poseidon.circom";
include "circomlib/circuits/comparators.circom";

// Password-less login: prove knowledge of a password that hashes (with salt)
// to a stored commitment C using Poseidon.
//
// Public:
//   C  – Poseidon(pwd, salt) commitment stored by server
//   ok – Boolean (1 if proof is valid)
// Private:
//   pwd  – password mapped to a field element (see JS helper)
//   salt – 128-bit random value generated during signup
//
// Total constraints: Poseidon(2 inputs) ≈ 63 + IsZero (4) + boolean (1) ≈ 68

template PwdLogin() {
    // ---- Inputs ----
    signal input pwd;     // private password field element
    signal input salt;    // private salt field element
    signal input C;       // public commitment

    // ---- Output ----
    signal output ok;     // 1 if commitment matches, 0 otherwise

    // ---- Hash computation ----
    component hash = Poseidon(2);
    hash.inputs[0] <== pwd;
    hash.inputs[1] <== salt;

    // Equality check via IsEqual template
    component eq = IsEqual();
    eq.in[0] <== hash.out;
    eq.in[1] <== C;

    ok <== eq.out;

    // Enforce ok boolean (redundant)
    ok * (ok - 1) === 0;
}

component main = PwdLogin(); 