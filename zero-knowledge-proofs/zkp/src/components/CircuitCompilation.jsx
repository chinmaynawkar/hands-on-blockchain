import React, { useState, useEffect, useCallback } from 'react'
import { useZK } from '../context/ZKContext'
import { checkCircuitAvailability, loadCircuit } from '../utils/zkProof'

export function CircuitCompilation() {
  const { circuit, updateZKState, completeStep } = useZK()
  const [isLoading, setIsLoading] = useState(false)
  const [availability, setAvailability] = useState(null)
  const [error, setError] = useState(null)
  const [loadingStep, setLoadingStep] = useState('')

  // Check circuit availability on mount
  useEffect(() => {
    checkAvailability()
  }, [])

  const checkAvailability = useCallback(async () => {
    try {
      const status = await checkCircuitAvailability()
      setAvailability(status)
      
      if (status.ready && !circuit) {
        // Auto-load if available
        handleLoadCircuit()
      }
    } catch (err) {
      setError(`Failed to check circuit availability: ${err.message}`)
    }
  }, [circuit])

  const handleLoadCircuit = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      setLoadingStep('Checking circuit files...')
      const status = await checkCircuitAvailability()
      
      if (!status.ready) {
        throw new Error('Circuit files not ready. Please compile and setup the circuit first.')
      }

      setLoadingStep('Loading WASM and zkey files...')
      const circuitFiles = await loadCircuit()
      
      setLoadingStep('Validating circuit...')
      // Simple validation - check file sizes
      if (circuitFiles.wasm.length < 1000 || circuitFiles.zkey.length < 1000) {
        throw new Error('Circuit files appear to be corrupted')
      }

      updateZKState('circuit', {
        wasm: circuitFiles.wasm,
        zkey: circuitFiles.zkey,
        loaded: true,
        timestamp: Date.now()
      })
      
      completeStep('circuit')
      setLoadingStep('')

    } catch (err) {
      setError(`Circuit loading failed: ${err.message}`)
      setLoadingStep('')
    } finally {
      setIsLoading(false)
    }
  }, [updateZKState, completeStep])

  const getStatusColor = (status) => {
    if (status === undefined) return 'text-gray-500'
    return status ? 'text-neon-green' : 'text-red-500'
  }

  const getStatusIcon = (status) => {
    if (status === undefined) return '⏳'
    return status ? '✅' : '❌'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-cyber-primary mb-2">
          Load Age Verification Circuit
        </h2>
        <p className="text-gray-400">
          Load the compiled Circom circuit for age verification
        </p>
      </div>

      {/* Circuit Status */}
      <div className="cyber-card p-6">
        <h3 className="text-lg font-semibold text-cyber-primary mb-4">
          Circuit Status
        </h3>
        
        {availability ? (
          <div className="space-y-2 font-mono text-sm">
            <div className="flex items-center justify-between">
              <span>WASM Generator:</span>
              <span className={getStatusColor(availability.wasm)}>
                {getStatusIcon(availability.wasm)} {availability.wasm ? 'Ready' : 'Missing'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Proving Key:</span>
              <span className={getStatusColor(availability.zkey)}>
                {getStatusIcon(availability.zkey)} {availability.zkey ? 'Ready' : 'Missing'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Verification Key:</span>
              <span className={getStatusColor(availability.vkey)}>
                {getStatusIcon(availability.vkey)} {availability.vkey ? 'Ready' : 'Missing'}
              </span>
            </div>
            <div className="border-t border-gray-600 pt-2 mt-2">
              <div className="flex items-center justify-between font-bold">
                <span>Overall Status:</span>
                <span className={getStatusColor(availability.ready)}>
                  {getStatusIcon(availability.ready)} {availability.ready ? 'Ready' : 'Not Ready'}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-400">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyber-primary mx-auto mb-2"></div>
            <p>Checking circuit availability...</p>
          </div>
        )}
      </div>

      {/* Circuit Not Ready - Instructions */}
      {availability && !availability.ready && (
        <div className="cyber-card p-6 border-cyber-secondary">
          <div className="flex items-start space-x-3">
            <div className="text-2xl">⚠️</div>
            <div>
              <h3 className="text-lg font-semibold text-cyber-secondary mb-2">
                Circuit Setup Required
              </h3>
              <p className="text-gray-300 mb-4">
                The age verification circuit needs to be compiled and set up before use.
              </p>
              
              <div className="bg-cyber-darker p-4 rounded border border-cyber-secondary/30">
                <h4 className="font-semibold text-cyber-secondary mb-2">Setup Commands:</h4>
                <div className="font-mono text-sm space-y-1">
                  <div className="text-gray-300"># 1. Install circomlib dependencies</div>
                  <div className="text-cyber-primary">npm run circuit:install</div>
                  <div className="text-gray-300"># 2. Compile the circuit</div>
                  <div className="text-cyber-primary">npm run circuit:compile</div>
                  <div className="text-gray-300"># 3. Setup trusted ceremony</div>
                  <div className="text-cyber-primary">npm run circuit:setup</div>
                </div>
              </div>
              
              <div className="mt-4 text-sm text-gray-400">
                <p>💡 <strong>Note:</strong> This process may take several minutes for the trusted setup ceremony.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Load Circuit */}
      {availability && availability.ready && !circuit && (
        <div className="text-center">
          <button
            onClick={handleLoadCircuit}
            disabled={isLoading}
            className="cyber-button"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-cyber-primary"></div>
                <span>{loadingStep || 'Loading Circuit...'}</span>
              </div>
            ) : (
              'Load Circuit'
            )}
          </button>
        </div>
      )}

      {/* Circuit Loaded */}
      {circuit && (
        <div className="cyber-card p-6 bg-neon-green/10 border-neon-green/30">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-neon-green rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-cyber-dark" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-neon-green">Circuit Loaded Successfully</h3>
              <p className="text-gray-300">
                Age verification circuit is ready for proof generation
              </p>
            </div>
          </div>
          
          <div className="mt-4 text-sm text-gray-400">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="font-semibold">WASM Size:</span> {(circuit.wasm.length / 1024).toFixed(1)} KB
              </div>
              <div>
                <span className="font-semibold">zKey Size:</span> {(circuit.zkey.length / 1024).toFixed(1)} KB
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="cyber-card p-6 border-red-500 bg-red-500/10">
          <div className="flex items-start space-x-3">
            <div className="text-2xl">❌</div>
            <div>
              <h3 className="text-lg font-semibold text-red-500 mb-2">
                Error Loading Circuit
              </h3>
              <p className="text-gray-300">{error}</p>
              <button
                onClick={() => {
                  setError(null)
                  checkAvailability()
                }}
                className="mt-3 cyber-button text-sm"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Circuit Information */}
      <div className="cyber-card p-6">
        <h3 className="text-lg font-semibold text-cyber-primary mb-4">
          About the Age Verification Circuit
        </h3>
        <div className="space-y-3 text-sm text-gray-300">
          <div className="flex items-start space-x-3">
            <span className="text-cyber-accent">🔧</span>
            <div>
              <strong>Circuit Language:</strong> Circom 2.0 with circomlib components
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <span className="text-cyber-accent">🔐</span>
            <div>
              <strong>Hash Function:</strong> Poseidon (ZK-friendly hash)
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <span className="text-cyber-accent">🎯</span>
            <div>
              <strong>Proof System:</strong> Groth16 (requires trusted setup)
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <span className="text-cyber-accent">🛡️</span>
            <div>
              <strong>Privacy:</strong> Proves age ≥ 18 without revealing exact age or birth date
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 