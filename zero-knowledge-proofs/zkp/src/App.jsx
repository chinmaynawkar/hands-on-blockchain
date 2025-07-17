import React, { useState, useCallback, useEffect } from 'react'
import { KeyGeneration } from './components/KeyGeneration'
import { AgeInput } from './components/AgeInput'
import { CircuitCompilation } from './components/CircuitCompilation'
import { ProofGeneration } from './components/ProofGeneration'
import { ProofVerification } from './components/ProofVerification'
import { StepIndicator } from './components/StepIndicator'
import { HelpPanel } from './components/HelpPanel'
import { ZKContext } from './context/ZKContext'

const STEPS = [
  { id: 'keys', title: 'Generate Keys', description: 'Create BabyJubJub keypair' },
  { id: 'age', title: 'Enter Age', description: 'Input birth date securely' },
  { id: 'circuit', title: 'Compile Circuit', description: 'Load age verification circuit' },
  { id: 'proof', title: 'Generate Proof', description: 'Create ZK proof of age ≥ 18' },
  { id: 'verify', title: 'Verify Proof', description: 'Validate proof locally' }
]

function App() {
  const [currentStep, setCurrentStep] = useState('keys')
  const [completedSteps, setCompletedSteps] = useState([])
  const [zkState, setZkState] = useState({
    keys: null,
    birthDate: null,
    circuit: null,
    proof: null,
    verificationResult: null
  })
  const [showHelp, setShowHelp] = useState(false)

  const updateZKState = useCallback((key, value) => {
    setZkState(prev => ({
      ...prev,
      [key]: value
    }))
  }, [])

  const completeStep = useCallback((stepId) => {
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps(prev => [...prev, stepId])
    }
    
    // Auto-advance to next step
    const currentIndex = STEPS.findIndex(step => step.id === stepId)
    if (currentIndex < STEPS.length - 1) {
      setCurrentStep(STEPS[currentIndex + 1].id)
    }
  }, [completedSteps])

  const resetFlow = useCallback(() => {
    setCurrentStep('keys')
    setCompletedSteps([])
    setZkState({
      keys: null,
      birthDate: null,
      circuit: null,
      proof: null,
      verificationResult: null
    })
  }, [])

  const contextValue = {
    ...zkState,
    updateZKState,
    completeStep,
    resetFlow,
    currentStep,
    completedSteps
  }

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'keys':
        return <KeyGeneration />
      case 'age':
        return <AgeInput />
      case 'circuit':
        return <CircuitCompilation />
      case 'proof':
        return <ProofGeneration />
      case 'verify':
        return <ProofVerification />
      default:
        return <KeyGeneration />
    }
  }

  return (
    <ZKContext.Provider value={contextValue}>
      <div className="min-h-screen bg-cyber-darker bg-cyber-grid">
        {/* Header */}
        <header className="border-b border-gray-800 bg-cyber-dark/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-gradient-to-br from-cyber-primary to-cyber-accent rounded-lg flex items-center justify-center">
                  <span className="text-cyber-dark font-bold text-lg">Z</span>
                </div>
                <div>
                  <h1 className="text-xl font-oxanium font-bold text-cyber-primary glitch-text" data-text="ZKAge">
                    ZKAge
                  </h1>
                  <p className="text-xs text-gray-400">Zero Knowledge Age Verification</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowHelp(!showHelp)}
                  className="cyber-button text-xs"
                >
                  {showHelp ? 'Hide Help' : 'Show Help'}
                </button>
                <button
                  onClick={resetFlow}
                  className="cyber-button text-xs bg-cyber-secondary/10 border-cyber-secondary text-cyber-secondary hover:bg-cyber-secondary hover:text-white"
                >
                  Reset Demo
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Progress Steps */}
            <div className="lg:col-span-1">
              <div className="cyber-card p-6">
                <h2 className="text-lg font-semibold text-cyber-primary mb-4">
                  Verification Flow
                </h2>
                <StepIndicator 
                  steps={STEPS}
                  currentStep={currentStep}
                  completedSteps={completedSteps}
                  onStepClick={setCurrentStep}
                />
              </div>
            </div>

            {/* Main Content */}
            <div className={`${showHelp ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
              <div className="cyber-card p-8">
                {renderCurrentStep()}
              </div>
            </div>

            {/* Help Panel */}
            {showHelp && (
              <div className="lg:col-span-1">
                <HelpPanel currentStep={currentStep} />
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-gray-800 bg-cyber-dark/50 backdrop-blur-sm mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="text-center text-gray-400 text-sm">
              <p>
                🔒 All computation happens client-side. Your data never leaves your browser.
              </p>
              <p className="mt-2">
                Built with{' '}
                <span className="text-cyber-primary">Circom</span>,{' '}
                <span className="text-cyber-primary">SnarkJS</span>, and{' '}
                <span className="text-cyber-primary">BabyJubJub</span> cryptography
              </p>
            </div>
          </div>
        </footer>
      </div>
    </ZKContext.Provider>
  )
}

export default App 