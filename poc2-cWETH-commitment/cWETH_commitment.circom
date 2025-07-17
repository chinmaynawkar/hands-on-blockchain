// File: cWETH_commitment.circom
pragma circom 2.0.0;

/*
 * 1. Import the necessary elliptic curve components from circomlib.
 * This gives us access to pre-built templates for curve operations.
 * The path should be relative to where you run the circom command.
 */
include "../circomlib/circuits/babyjub.circom";
include "../circomlib/circuits/escalarmulany.circom";
include "../circomlib/circuits/bitify.circom";

/*
 * 2. Define the circuit template for our ElGamal Commitment.
 * This circuit will take private values (balance, nonce) and a public key,
 * and output the corresponding public commitment points (C, D).
 */
template ElGamalCommit() {
    // === PRIVATE INPUTS ===
    // These are the secret values known only to the user creating the proof.
    signal input balance;
    signal input randomNonce;

    // === PUBLIC INPUTS ===
    // The user's public key, which is a point on the BabyJubJub curve.
    // A point is represented by two coordinates, [x, y].
    signal input publicKey[2];

    // === PUBLIC OUTPUTS ===
    // The resulting commitment, which consists of two points on the curve.
    // This commitment can be made public without revealing the balance.
    signal output commitmentC[2];
    signal output commitmentD[2];

    // === CONSTANTS ===
    // BabyJubJub generator point G
    var BASE8[2] = [
        5299619240641551281634865583518297030282874472190772894086521144482721001553,
        16950150798460657717958625567821834550301663161624707787222815936182638968203
    ];

    // === LOGIC: Instantiate circomlib components ===
    // Here, we wire together the pre-built components to perform the calculations.

    // Convert scalars to binary format (required by EscalarMulAny)
    component randomNonceBits = Num2Bits(253);
    randomNonceBits.in <== randomNonce;

    component balanceBits = Num2Bits(253);
    balanceBits.in <== balance;

    // 3. Calculate commitmentC = randomNonce * G
    // We use the EscalarMulAny component to multiply the curve's generator point (G)
    // by the private randomNonce.
    component commitment_C_calc = EscalarMulAny(253);
    commitment_C_calc.p[0] <== BASE8[0];
    commitment_C_calc.p[1] <== BASE8[1];
    for (var i = 0; i < 253; i++) {
        commitment_C_calc.e[i] <== randomNonceBits.out[i];
    }

    // 4. Calculate term1_D = balance * G
    // We use another EscalarMulAny component for this operation.
    component term1_D_calc = EscalarMulAny(253);
    term1_D_calc.p[0] <== BASE8[0];
    term1_D_calc.p[1] <== BASE8[1];
    for (var i = 0; i < 253; i++) {
        term1_D_calc.e[i] <== balanceBits.out[i];
    }

    // 5. Calculate term2_D = randomNonce * publicKey
    // This multiplies the user's public key by the same randomNonce.
    component term2_D_calc = EscalarMulAny(253);
    term2_D_calc.p[0] <== publicKey[0];
    term2_D_calc.p[1] <== publicKey[1];
    for (var i = 0; i < 253; i++) {
        term2_D_calc.e[i] <== randomNonceBits.out[i];
    }

    // 6. Calculate commitmentD = term1_D + term2_D
    // We use the BabyAdd component to add the two points we just calculated.
    component commitment_D_calc = BabyAdd();
    commitment_D_calc.x1 <== term1_D_calc.out[0];
    commitment_D_calc.y1 <== term1_D_calc.out[1];
    commitment_D_calc.x2 <== term2_D_calc.out[0];
    commitment_D_calc.y2 <== term2_D_calc.out[1];

    // 7. Assign the final calculated values to the public outputs.
    commitmentC[0] <== commitment_C_calc.out[0];
    commitmentC[1] <== commitment_C_calc.out[1];
    commitmentD[0] <== commitment_D_calc.xout;
    commitmentD[1] <== commitment_D_calc.yout;
}

// Instantiate the main component of our circuit.
component main = ElGamalCommit(); 