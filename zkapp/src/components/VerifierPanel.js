import React, { useState } from "react";

const VerifierPanel = ({ protocol, protocolState, onUpdate, isActive }) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleGenerateChallenge = async () => {
    setLoading(true);
    try {
      const response = protocol.generateChallenge();
      setResult(response);
      onUpdate();
    } catch (error) {
      setResult({ success: false, message: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyProof = async () => {
    setLoading(true);
    try {
      const response = await protocol.verifyProof();
      setResult(response);
      onUpdate();
    } catch (error) {
      setResult({ success: false, message: error.message });
    } finally {
      setLoading(false);
    }
  };

  const renderCommitmentReceived = () => (
    <div className="space-y-4">
      <div className="bg-cyber-darker p-4 rounded-lg border border-gray-600">
        <div className="text-sm font-mono text-gray-300 mb-2">
          Received Commitment:
        </div>
        {protocolState.commitment ? (
          <div className="text-neon-green font-mono text-xs break-all">
            {protocolState.commitment}
          </div>
        ) : (
          <div className="text-gray-500 font-mono text-sm">
            Waiting for prover commitment...
          </div>
        )}
      </div>
    </div>
  );

  const renderChallengeGeneration = () => (
    <div className="space-y-4">
      <div className="bg-cyber-darker p-4 rounded-lg border border-gray-600">
        <div className="text-sm font-mono text-gray-300 mb-2">
          Received Commitment:
        </div>
        <div className="text-neon-green font-mono text-xs break-all">
          {protocolState.commitment}
        </div>
      </div>

      {!protocolState.steps.challenge && protocolState.steps.commitment && (
        <button
          onClick={handleGenerateChallenge}
          disabled={loading}
          className="cyber-button w-full"
        >
          {loading ? "Generating..." : "Generate Challenge"}
        </button>
      )}

      {protocolState.challenge && (
        <div className="bg-cyber-darker p-4 rounded-lg border border-blue-500">
          <div className="text-sm font-mono text-gray-300 mb-2">
            Random Challenge:
          </div>
          <div className="text-cyber-accent font-mono text-2xl">
            {protocolState.challenge}
          </div>
        </div>
      )}
    </div>
  );

  const renderVerification = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        <div className="bg-cyber-darker p-4 rounded-lg border border-gray-600">
          <div className="text-sm font-mono text-gray-300 mb-2">Challenge:</div>
          <div className="text-cyber-accent font-mono">
            {protocolState.challenge}
          </div>
        </div>

        <div className="bg-cyber-darker p-4 rounded-lg border border-gray-600">
          <div className="text-sm font-mono text-gray-300 mb-2">Response:</div>
          <div className="text-cyber-warning font-mono text-xl">
            {protocolState.response !== null
              ? protocolState.response
              : "Waiting for response..."}
          </div>
        </div>
      </div>

      {protocolState.response !== null && !protocolState.steps.verification && (
        <button
          onClick={handleVerifyProof}
          disabled={loading}
          className="cyber-button w-full"
        >
          {loading ? "Verifying..." : "Verify Proof"}
        </button>
      )}

      {protocolState.steps.verification && result && (
        <div
          className={`p-4 rounded-lg border ${
            result.isValid
              ? "bg-green-900/30 border-green-500"
              : "bg-red-900/30 border-red-500"
          }`}
        >
          <div
            className={`text-2xl mb-2 ${
              result.isValid ? "text-green-400" : "text-red-400"
            }`}
          >
            {result.isValid ? "✅ PROOF VALID" : "❌ PROOF INVALID"}
          </div>
          <div
            className={`font-mono text-sm mb-4 ${
              result.isValid ? "text-green-300" : "text-red-300"
            }`}
          >
            {result.message}
          </div>

          {result.isValid && result.verification && (
            <div className="space-y-2 text-xs font-mono text-gray-300">
              <div>Reconstructed Nonce: {result.reconstructedNonce}</div>
              <div>
                Commitment Match:{" "}
                {result.verification.commitmentMatch ? "✓" : "✗"}
              </div>
              <div className="text-green-400 font-bold">
                ✓ Prover knows the secret without revealing it!
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const getCurrentStepContent = () => {
    if (!protocolState.steps.commitment) {
      return renderCommitmentReceived();
    } else if (!protocolState.steps.challenge) {
      return renderChallengeGeneration();
    } else if (!protocolState.steps.verification) {
      return renderVerification();
    } else {
      return (
        <div className="text-center py-8">
          <div
            className={`text-4xl mb-4 ${
              protocolState.isProofValid ? "text-green-400" : "text-red-400"
            }`}
          >
            {protocolState.isProofValid ? "✅" : "❌"}
          </div>
          <div
            className={`font-mono text-lg ${
              protocolState.isProofValid ? "text-green-300" : "text-red-300"
            }`}
          >
            {protocolState.isProofValid
              ? "Proof Verified Successfully!"
              : "Proof Verification Failed!"}
          </div>
          <div className="text-gray-400 text-sm mt-2">
            {protocolState.isProofValid
              ? "Prover knows the secret without revealing it."
              : "The prover could not prove knowledge of the secret."}
          </div>
        </div>
      );
    }
  };

  return (
    <div
      className={`cyber-card p-6 transition-all duration-300 ${
        isActive ? "ring-2 ring-cyber-accent" : ""
      }`}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-oxanium font-bold text-cyber-accent">
          🔍 Verifier
        </h2>
        <div
          className={`status-indicator ${
            isActive ? "bg-cyber-accent" : "bg-gray-500"
          }`}
        />
      </div>

      <div className="space-y-6">
        {getCurrentStepContent()}

        {result && (
          <div
            className={`p-4 rounded-lg border ${
              result.success
                ? "bg-green-900/30 border-green-500 text-green-300"
                : "bg-red-900/30 border-red-500 text-red-300"
            }`}
          >
            <div className="font-mono text-sm">{result.message}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifierPanel;
