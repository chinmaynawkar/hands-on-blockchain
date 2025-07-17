import React from 'react'

export function StepIndicator({ steps, currentStep, completedSteps, onStepClick }) {
  const getStepStatus = (stepId) => {
    if (completedSteps.includes(stepId)) return 'completed'
    if (stepId === currentStep) return 'active'
    return 'pending'
  }

  const getStepClasses = (status) => {
    const baseClasses = 'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200 cursor-pointer'
    
    switch (status) {
      case 'completed':
        return `${baseClasses} step-completed`
      case 'active':
        return `${baseClasses} step-active`
      default:
        return `${baseClasses} step-pending`
    }
  }

  const getConnectorClasses = (index) => {
    const isCompleted = completedSteps.includes(steps[index]?.id)
    const baseClasses = 'w-0.5 h-8 mx-auto transition-all duration-300'
    
    return isCompleted 
      ? `${baseClasses} bg-neon-green`
      : `${baseClasses} bg-gray-600`
  }

  return (
    <div className="space-y-1">
      {steps.map((step, index) => {
        const status = getStepStatus(step.id)
        const isClickable = completedSteps.includes(step.id) || step.id === currentStep
        
        return (
          <div key={step.id} className="relative">
            <div 
              className={`flex items-start space-x-3 p-3 rounded-lg transition-all duration-200 ${
                status === 'active' ? 'bg-cyber-primary/10' : 'hover:bg-gray-800/50'
              } ${isClickable ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'}`}
              onClick={() => isClickable && onStepClick(step.id)}
            >
              {/* Step Number/Icon */}
              <div className={getStepClasses(status)}>
                {status === 'completed' ? (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>

              {/* Step Content */}
              <div className="flex-1 min-w-0">
                <h3 className={`text-sm font-medium ${
                  status === 'active' ? 'text-cyber-primary' : 
                  status === 'completed' ? 'text-neon-green' : 'text-gray-400'
                }`}>
                  {step.title}
                </h3>
                <p className="text-xs text-gray-500 mt-1">{step.description}</p>
              </div>

              {/* Status Indicator */}
              {status === 'active' && (
                <div className="flex-shrink-0">
                  <div className="status-indicator bg-cyber-primary animate-pulse-neon"></div>
                </div>
              )}
            </div>

            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div className={getConnectorClasses(index)}></div>
            )}
          </div>
        )
      })}
    </div>
  )
} 