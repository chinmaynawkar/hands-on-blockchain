import React, { useState } from "react";

const HelpPanel = ({ protocol, currentStep }) => {
  const [activeTab, setActiveTab] = useState("overview");

  const tabs = [
    { id: "overview", label: "Overview", icon: "📚" },
    { id: "properties", label: "ZKP Properties", icon: "🔐" },
    { id: "protocol", label: "Protocol", icon: "⚙️" },
    { id: "security", label: "Security", icon: "🛡️" },
  ];

  const zkpProperties = [
    {
      name: "Completeness",
      description:
        "If the prover knows the secret, they can always convince the verifier.",
      example:
        "When you know the password, you can always generate a valid proof.",
      icon: "✅",
    },
    {
      name: "Soundness",
      description:
        "If the prover doesn't know the secret, they cannot convince the verifier.",
      example: "Without knowing the password, you cannot create a valid proof.",
      icon: "🚫",
    },
    {
      name: "Zero-Knowledge",
      description:
        "The verifier learns nothing about the secret beyond its validity.",
      example:
        "The verifier confirms you know the password without learning what it is.",
      icon: "👁️‍🗨️",
    },
  ];

  const protocolSteps = [
    {
      step: 1,
      title: "Shared Secret Setup",
      description:
        "Both parties agree on a secret. In real applications, only the prover knows this.",
      purpose: "Establishes what needs to be proven",
    },
    {
      step: 2,
      title: "Commitment Generation",
      description:
        "Prover creates hash(secret + random_nonce) to commit to their knowledge.",
      purpose: "Binds the prover to their claim without revealing the secret",
    },
    {
      step: 3,
      title: "Challenge Generation",
      description:
        "Verifier generates a random number to prevent pre-computed responses.",
      purpose: "Ensures freshness and prevents replay attacks",
    },
    {
      step: 4,
      title: "Response Calculation",
      description:
        "Prover computes (secret_value + nonce) % challenge using the secret.",
      purpose: "Provides proof of knowledge without revealing the secret",
    },
    {
      step: 5,
      title: "Verification",
      description:
        "Verifier reconstructs the nonce and validates the commitment.",
      purpose: "Confirms the prover's knowledge without learning the secret",
    },
  ];

  const securityConsiderations = [
    {
      title: "Random Nonce",
      description:
        "Each proof session uses a fresh random nonce to prevent replay attacks.",
      importance: "Critical",
    },
    {
      title: "Cryptographic Hash",
      description: "SHA-256 ensures the commitment is binding and hiding.",
      importance: "Essential",
    },
    {
      title: "Challenge Randomness",
      description: "Random challenges prevent pre-computation of responses.",
      importance: "High",
    },
    {
      title: "Modular Arithmetic",
      description:
        "Mathematical operations hide the secret while enabling verification.",
      importance: "Core",
    },
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="text-4xl mb-4">🧠</div>
        <h3 className="text-xl font-oxanium font-bold text-cyber-primary mb-2">
          What are Zero-Knowledge Proofs?
        </h3>
        <p className="text-gray-300 leading-relaxed">
          Zero-Knowledge Proofs allow you to prove you know something without
          revealing what it is. Think of it like proving you know a password
          without actually telling anyone the password.
        </p>
      </div>

      <div className="bg-cyber-darker p-4 rounded-lg border border-gray-600">
        <h4 className="font-bold text-cyber-accent mb-2">
          Real-World Analogy:
        </h4>
        <p className="text-gray-300 text-sm leading-relaxed">
          Imagine you want to prove you know the location of a treasure without
          revealing where it is. You could bring back a unique item from that
          location that only someone who's been there could have. This proves
          your knowledge without revealing the location itself.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div className="bg-gradient-to-r from-green-900/30 to-green-800/30 p-4 rounded-lg border border-green-500">
          <h4 className="font-bold text-green-400 mb-2">✅ With ZKP:</h4>
          <p className="text-green-300 text-sm">
            "I can prove I know the password without telling you what it is."
          </p>
        </div>

        <div className="bg-gradient-to-r from-red-900/30 to-red-800/30 p-4 rounded-lg border border-red-500">
          <h4 className="font-bold text-red-400 mb-2">❌ Without ZKP:</h4>
          <p className="text-red-300 text-sm">
            "To prove I know the password, I have to tell you what it is."
          </p>
        </div>
      </div>
    </div>
  );

  const renderProperties = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-oxanium font-bold text-cyber-primary mb-4">
        The Three Pillars of Zero-Knowledge
      </h3>

      {zkpProperties.map((property, index) => (
        <div
          key={index}
          className="bg-cyber-darker p-4 rounded-lg border border-gray-600"
        >
          <div className="flex items-start space-x-3">
            <div className="text-2xl">{property.icon}</div>
            <div className="flex-1">
              <h4 className="font-bold text-cyber-accent mb-2">
                {property.name}
              </h4>
              <p className="text-gray-300 text-sm mb-2">
                {property.description}
              </p>
              <div className="bg-cyber-dark p-2 rounded border border-gray-700">
                <p className="text-cyber-primary text-xs italic">
                  Example: {property.example}
                </p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderProtocol = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-oxanium font-bold text-cyber-primary mb-4">
        Protocol Steps Explained
      </h3>

      {protocolSteps.map((step, index) => {
        const isActive =
          currentStep === Object.keys(protocol.getState().steps)[index];
        const isCompleted =
          protocol.getState().steps[
            Object.keys(protocol.getState().steps)[index]
          ];

        return (
          <div
            key={index}
            className={`bg-cyber-darker p-4 rounded-lg border ${
              isActive
                ? "border-cyber-primary"
                : isCompleted
                ? "border-green-500"
                : "border-gray-600"
            }`}
          >
            <div className="flex items-start space-x-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  isActive
                    ? "bg-cyber-primary text-cyber-dark"
                    : isCompleted
                    ? "bg-green-500 text-white"
                    : "bg-gray-600 text-gray-300"
                }`}
              >
                {isCompleted ? "✓" : step.step}
              </div>
              <div className="flex-1">
                <h4
                  className={`font-bold mb-2 ${
                    isActive
                      ? "text-cyber-primary"
                      : isCompleted
                      ? "text-green-400"
                      : "text-gray-400"
                  }`}
                >
                  {step.title}
                </h4>
                <p className="text-gray-300 text-sm mb-2">{step.description}</p>
                <div className="bg-cyber-dark p-2 rounded border border-gray-700">
                  <p className="text-cyber-accent text-xs">
                    <strong>Purpose:</strong> {step.purpose}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderSecurity = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-oxanium font-bold text-cyber-primary mb-4">
        Security Considerations
      </h3>

      {securityConsiderations.map((item, index) => {
        const importanceColors = {
          Critical: "border-red-500 text-red-400",
          Essential: "border-orange-500 text-orange-400",
          High: "border-yellow-500 text-yellow-400",
          Core: "border-blue-500 text-blue-400",
        };

        return (
          <div
            key={index}
            className="bg-cyber-darker p-4 rounded-lg border border-gray-600"
          >
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-bold text-cyber-accent">{item.title}</h4>
              <span
                className={`text-xs px-2 py-1 rounded border ${
                  importanceColors[item.importance]
                }`}
              >
                {item.importance}
              </span>
            </div>
            <p className="text-gray-300 text-sm">{item.description}</p>
          </div>
        );
      })}

      <div className="bg-gradient-to-r from-purple-900/30 to-purple-800/30 p-4 rounded-lg border border-purple-500">
        <h4 className="font-bold text-purple-400 mb-2">🔒 Educational Note:</h4>
        <p className="text-purple-300 text-sm">
          This demonstration is simplified for learning. Production ZKP systems
          use more sophisticated cryptographic primitives and additional
          security measures.
        </p>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return renderOverview();
      case "properties":
        return renderProperties();
      case "protocol":
        return renderProtocol();
      case "security":
        return renderSecurity();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="cyber-card p-6">
      <h2 className="text-2xl font-oxanium font-bold text-cyber-primary mb-6">
        📖 Help & Education
      </h2>

      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded font-mono text-sm transition-all duration-300 ${
              activeTab === tab.id
                ? "bg-cyber-primary text-cyber-dark border border-cyber-primary"
                : "bg-transparent text-gray-400 border border-gray-600 hover:border-cyber-primary hover:text-cyber-primary"
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      <div className="min-h-[400px]">{renderContent()}</div>
    </div>
  );
};

export default HelpPanel;
