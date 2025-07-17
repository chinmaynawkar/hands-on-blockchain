import React, { useState, useCallback, useEffect } from "react";
import { ZKPProtocol } from "./utils/zkpProtocol";
import StepIndicator from "./components/StepIndicator";
import ProverPanel from "./components/ProverPanel";
import VerifierPanel from "./components/VerifierPanel";
import HelpPanel from "./components/HelpPanel";
import "./index.css";

function App() {
  const [protocol] = useState(() => new ZKPProtocol());
  const [protocolState, setProtocolState] = useState(protocol.getState());
  const [activePanel, setActivePanel] = useState("prover");
  const [currentStep, setCurrentStep] = useState("secretSetup");
  const [showHelp, setShowHelp] = useState(false);

  // Update protocol state when changes occur
  const updateProtocolState = useCallback(() => {
    const newState = protocol.getState();
    console.log("🔄 Updating App State:", newState);
    console.log("🎯 isProofValid:", newState.isProofValid);
    console.log("🎯 verification step:", newState.steps.verification);
    setProtocolState(newState);

    // Determine current step and active panel
    if (!newState.steps.secretSetup) {
      setCurrentStep("secretSetup");
      setActivePanel("prover");
    } else if (!newState.steps.commitment) {
      setCurrentStep("commitment");
      setActivePanel("prover");
    } else if (!newState.steps.challenge) {
      setCurrentStep("challenge");
      setActivePanel("verifier");
    } else if (!newState.steps.response) {
      setCurrentStep("response");
      setActivePanel("prover");
    } else if (!newState.steps.verification) {
      setCurrentStep("verification");
      setActivePanel("verifier");
    } else {
      setCurrentStep("verification");
      setActivePanel("both");
    }
  }, [protocol]);

  // Reset protocol to start over
  const handleReset = useCallback(() => {
    protocol.reset();
    updateProtocolState();
  }, [protocol, updateProtocolState]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === "h" || event.key === "H") {
        setShowHelp(!showHelp);
      } else if (event.key === "r" || event.key === "R") {
        handleReset();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [showHelp, handleReset]);

  const getStepExplanation = (step) => {
    return protocol.getStepExplanation(step);
  };

  return (
    <div className="min-h-screen bg-cyber-dark bg-cyber-grid">
      {/* Header */}
      <header className="border-b border-cyber-primary/30 bg-cyber-darker/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-4xl font-oxanium font-bold text-cyber-primary">
                ZKP Demo
              </h1>
              <div className="text-gray-400 text-sm font-inter">
                Prove You Know Without Revealing
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowHelp(!showHelp)}
                className="cyber-button"
                title="Toggle Help Panel (H)"
              >
                {showHelp ? "Hide Help" : "Show Help"}
              </button>

              <button
                onClick={handleReset}
                className="cyber-button"
                title="Reset Protocol (R)"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Protocol Status */}
          <div className="mt-4 flex items-center space-x-6 text-sm font-mono">
            <div className="flex items-center space-x-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  protocolState.steps.secretSetup
                    ? "bg-neon-green"
                    : "bg-gray-500"
                }`}
              />
              <span className="text-gray-300">
                Secret: {protocolState.sharedSecret ? "✓" : "✗"}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  protocolState.commitment ? "bg-neon-green" : "bg-gray-500"
                }`}
              />
              <span className="text-gray-300">
                Commitment: {protocolState.commitment ? "✓" : "✗"}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  protocolState.challenge ? "bg-neon-green" : "bg-gray-500"
                }`}
              />
              <span className="text-gray-300">
                Challenge: {protocolState.challenge ? "✓" : "✗"}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  protocolState.response !== null
                    ? "bg-neon-green"
                    : "bg-gray-500"
                }`}
              />
              <span className="text-gray-300">
                Response: {protocolState.response !== null ? "✓" : "✗"}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  protocolState.isProofValid !== null
                    ? protocolState.isProofValid
                      ? "bg-neon-green"
                      : "bg-red-500"
                    : "bg-gray-500"
                }`}
              />
              <span className="text-gray-300">
                Verification:{" "}
                {protocolState.isProofValid === null
                  ? "✗"
                  : protocolState.isProofValid
                  ? "✅"
                  : "❌"}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Step Indicator */}
        <StepIndicator steps={protocolState.steps} currentStep={currentStep} />

        {/* Current Step Explanation */}
        {currentStep && (
          <div className="cyber-card p-6 mb-6 border-l-4 border-cyber-accent">
            <div className="flex items-start space-x-4">
              <div className="text-2xl">🎯</div>
              <div>
                <h3 className="text-lg font-oxanium font-bold text-cyber-accent mb-2">
                  Current Step: {getStepExplanation(currentStep).title}
                </h3>
                <p className="text-gray-300 mb-3">
                  {getStepExplanation(currentStep).description}
                </p>
                <div className="bg-cyber-darker p-3 rounded border border-cyber-accent/30">
                  <h4 className="text-sm font-bold text-cyber-accent mb-1">
                    ZKP Property:
                  </h4>
                  <p className="text-sm text-gray-300">
                    {getStepExplanation(currentStep).zkpProperty}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Prover Panel */}
          <div className="space-y-6">
            <ProverPanel
              protocol={protocol}
              protocolState={protocolState}
              onUpdate={updateProtocolState}
              isActive={activePanel === "prover" || activePanel === "both"}
            />
          </div>

          {/* Verifier Panel */}
          <div className="space-y-6">
            <VerifierPanel
              protocol={protocol}
              protocolState={protocolState}
              onUpdate={updateProtocolState}
              isActive={activePanel === "verifier" || activePanel === "both"}
            />
          </div>
        </div>

        {/* Help Panel */}
        {showHelp && (
          <div className="mt-8 animate-slide-up">
            <HelpPanel protocol={protocol} currentStep={currentStep} />
          </div>
        )}

        {/* Debug Display */}
        {protocolState.steps.verification && (
          <div className="mt-6 cyber-card p-4 bg-blue-900/20 border-blue-500">
            <h3 className="font-bold text-blue-400 mb-2">
              🐛 Debug Information
            </h3>
            <div className="text-sm font-mono space-y-1">
              <div>
                Verification Step:{" "}
                {protocolState.steps.verification ? "✅" : "❌"}
              </div>
              <div>
                isProofValid:{" "}
                {protocolState.isProofValid !== null
                  ? protocolState.isProofValid
                    ? "✅ TRUE"
                    : "❌ FALSE"
                  : "⚪ NULL"}
              </div>
              <div>Response: {protocolState.response}</div>
              <div>Challenge: {protocolState.challenge}</div>
            </div>
          </div>
        )}

        {/* Protocol Complete Animation */}
        {false && protocolState.steps.verification && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="cyber-card p-8 max-w-md text-center animate-slide-up">
              <div
                className={`text-6xl mb-4 ${
                  protocolState.isProofValid ? "text-green-400" : "text-red-400"
                }`}
              >
                {protocolState.isProofValid ? "🎉" : "💥"}
              </div>

              <h2
                className={`text-2xl font-oxanium font-bold mb-4 ${
                  protocolState.isProofValid ? "text-green-400" : "text-red-400"
                }`}
              >
                {protocolState.isProofValid
                  ? "Zero-Knowledge Proof Complete!"
                  : "Proof Failed!"}
              </h2>

              <p className="text-gray-300 mb-6">
                {protocolState.isProofValid
                  ? "The prover successfully demonstrated knowledge of the secret without revealing it. This is the power of Zero-Knowledge Proofs!"
                  : "The proof could not be verified. The prover may not know the secret, or there was an error in the protocol."}
              </p>

              <div className="space-y-3">
                <button onClick={handleReset} className="cyber-button w-full">
                  Try Again
                </button>

                <button
                  onClick={() => setShowHelp(true)}
                  className="cyber-button w-full bg-transparent border-cyber-accent text-cyber-accent hover:bg-cyber-accent hover:text-cyber-dark"
                >
                  Learn More
                </button>
              </div>

              {/* Debug info in modal */}
              <div className="mt-4 p-3 bg-gray-800 rounded text-xs">
                <div>
                  DEBUG: isProofValid = {String(protocolState.isProofValid)}
                </div>
                <div>DEBUG: typeof = {typeof protocolState.isProofValid}</div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-cyber-primary/30 bg-cyber-darker/80 backdrop-blur-md mt-16">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between text-sm font-mono text-gray-400">
            <div>Developed by Chinmay Nawkar</div>
            <div className="flex items-center space-x-4">
              <div>Press 'H' for Help</div>
              <div>Press 'R' to Reset</div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
