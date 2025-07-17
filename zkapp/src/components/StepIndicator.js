import React from "react";

const StepIndicator = ({ steps, currentStep }) => {
  const stepList = [
    { key: "secretSetup", label: "Secret Setup", number: 1 },
    { key: "commitment", label: "Commitment", number: 2 },
    { key: "challenge", label: "Challenge", number: 3 },
    { key: "response", label: "Response", number: 4 },
    { key: "verification", label: "Verification", number: 5 },
  ];

  const getStepStatus = (stepKey) => {
    if (steps[stepKey]) return "completed";
    if (stepKey === currentStep) return "active";
    return "pending";
  };

  const getStepClasses = (status) => {
    const baseClasses =
      "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold font-mono transition-all duration-300";

    switch (status) {
      case "completed":
        return `${baseClasses} step-completed`;
      case "active":
        return `${baseClasses} step-active`;
      default:
        return `${baseClasses} step-pending`;
    }
  };

  return (
    <div className="cyber-card p-6 mb-6">
      <h3 className="text-xl font-oxanium font-bold text-cyber-primary mb-4">
        Protocol Progress
      </h3>

      <div className="flex items-center justify-between">
        {stepList.map((step, index) => {
          const status = getStepStatus(step.key);
          const isLast = index === stepList.length - 1;

          return (
            <React.Fragment key={step.key}>
              <div className="flex flex-col items-center">
                <div className={getStepClasses(status)}>
                  {status === "completed" ? "✓" : step.number}
                </div>
                <span
                  className={`text-xs mt-2 font-mono ${
                    status === "active"
                      ? "text-cyber-primary"
                      : status === "completed"
                      ? "text-neon-green"
                      : "text-gray-400"
                  }`}
                >
                  {step.label}
                </span>
              </div>

              {!isLast && (
                <div
                  className={`flex-1 h-0.5 mx-2 transition-all duration-300 ${
                    steps[step.key] ? "bg-neon-green" : "bg-gray-600"
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default StepIndicator;
