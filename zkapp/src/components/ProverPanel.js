import React, { useState } from "react";

const ProverPanel = ({ protocol, protocolState, onUpdate, isActive }) => {
  const [secret, setSecret] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleSecretSetup = async () => {
    if (!secret.trim()) {
      setResult({ success: false, message: "Please enter a secret" });
      return;
    }

    setLoading(true);
    try {
      const response = protocol.setupSharedSecret(secret);
      setResult(response);
      onUpdate();
    } catch (error) {
      setResult({ success: false, message: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCommitment = async () => {
    setLoading(true);
    try {
      const response = await protocol.generateCommitment();
      setResult(response);
      onUpdate();
    } catch (error) {
      setResult({ success: false, message: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateResponse = async (simulateFailure = false) => {
    setLoading(true);
    try {
      const response = protocol.generateResponse(simulateFailure);
      setResult(response);
      onUpdate();
    } catch (error) {
      setResult({ success: false, message: error.message });
    } finally {
      setLoading(false);
    }
  };

  const renderSecretSetup = () => (
    <div className="space-y-4">
      <div className="flex flex-col space-y-2">
        <label className="text-sm font-mono text-gray-300">
          Enter Secret Password:
        </label>
        <input
          type="password"
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
          placeholder="Enter your secret..."
          className="cyber-input"
          disabled={protocolState.steps.secretSetup}
        />
      </div>

      {!protocolState.steps.secretSetup && (
        <button
          onClick={handleSecretSetup}
          disabled={loading || !secret.trim()}
          className="cyber-button w-full"
        >
          {loading ? "Setting up..." : "Setup Secret"}
        </button>
      )}
    </div>
  );

  const renderCommitmentGeneration = () => (
    <div className="space-y-4">
      <div className="bg-cyber-darker p-4 rounded-lg border border-gray-600">
        <div className="text-sm font-mono text-gray-300 mb-2">Secret:</div>
        <div className="text-cyber-primary font-mono">
          {"*".repeat(protocolState.sharedSecret.length)} (hidden)
        </div>
      </div>

      {!protocolState.steps.commitment && protocolState.steps.secretSetup && (
        <button
          onClick={handleGenerateCommitment}
          disabled={loading}
          className="cyber-button w-full"
        >
          {loading ? "Generating..." : "Generate Commitment"}
        </button>
      )}

      {protocolState.commitment && (
        <div className="bg-cyber-darker p-4 rounded-lg border border-green-500">
          <div className="text-sm font-mono text-gray-300 mb-2">
            Commitment (hash):
          </div>
          <div className="text-neon-green font-mono text-xs break-all">
            {protocolState.commitment}
          </div>
          <div className="text-sm font-mono text-gray-300 mt-2">
            Nonce: {protocolState.proverNonce}
          </div>
        </div>
      )}
    </div>
  );

  const renderResponseGeneration = () => (
    <div className="space-y-4">
      <div className="bg-cyber-darker p-4 rounded-lg border border-gray-600">
        <div className="text-sm font-mono text-gray-300 mb-2">
          Received Challenge:
        </div>
        <div className="text-cyber-accent font-mono text-xl">
          {protocolState.challenge || "Waiting for challenge..."}
        </div>
      </div>

      {protocolState.challenge && !protocolState.steps.response && (
        <div className="space-y-3">
          <button
            onClick={() => handleGenerateResponse(false)}
            disabled={loading}
            className="cyber-button w-full"
          >
            {loading ? "Calculating..." : "Generate Correct Response"}
          </button>
          <button
            onClick={() => handleGenerateResponse(true)}
            disabled={loading}
            className="cyber-button w-full bg-transparent border-red-500 text-red-400 hover:bg-red-500 hover:text-white"
          >
            {loading ? "Calculating..." : "Generate Wrong Response (Demo)"}
          </button>
        </div>
      )}

      {protocolState.response !== null && result?.calculation && (
        <div className="bg-cyber-darker p-4 rounded-lg border border-yellow-500">
          <div className="text-sm font-mono text-gray-300 mb-2">
            Response Calculation:
          </div>
          <div className="text-cyber-warning font-mono text-sm mb-2">
            {result.calculation.formula}
          </div>
          <div className="text-cyber-warning font-mono text-xl">
            Response: {protocolState.response}
          </div>
        </div>
      )}
    </div>
  );

  const getCurrentStepContent = () => {
    if (!protocolState.steps.secretSetup) {
      return renderSecretSetup();
    } else if (!protocolState.steps.commitment) {
      return renderCommitmentGeneration();
    } else if (!protocolState.steps.response) {
      return renderResponseGeneration();
    } else {
      return (
        <div className="text-center py-8">
          <div className="text-neon-green text-2xl mb-2">✓</div>
          <div className="text-gray-300 font-mono">
            Proof generated successfully!
          </div>
          <div className="text-gray-400 text-sm mt-2">
            Waiting for verification...
          </div>
        </div>
      );
    }
  };

  return (
    <div
      className={`cyber-card p-6 transition-all duration-300 ${
        isActive ? "ring-2 ring-cyber-primary" : ""
      }`}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-oxanium font-bold text-cyber-primary">
          🔐 Prover
        </h2>
        <div
          className={`status-indicator ${
            isActive ? "bg-cyber-primary" : "bg-gray-500"
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

export default ProverPanel;
