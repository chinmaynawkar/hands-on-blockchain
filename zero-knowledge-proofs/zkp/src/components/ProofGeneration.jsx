import React, { useState, useCallback } from 'react'
import { useZK } from '../context/ZKContext'
import { generateCircuitInputs, generateProof, verifyProof, loadVerificationKey, parsePublicSignals } from '../utils/zkProof'

export function ProofGeneration() {
  const { circuit, birthDate, keys, updateZKState, completeStep } = useZK()
  const [isGenerating, setIsGenerating] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [proof, setProof] = useState(null)
  const [publicSignals, setPublicSignals] = useState(null)
  const [verificationResult, setVerificationResult] = useState(null)
  const [error, setError] = useState(null)
  const [progress, setProgress] = useState('')

  const handleGenerateProof = useCallback(async () => {
    if (!circuit || !birthDate || !keys) {
      setError('Missing required data. Please complete previous steps.')
      return
    }

    setIsGenerating(true)
    setError(null)
    setProgress('Preparing circuit inputs...')

    try {
      // Generate circuit inputs using real age calculation
      const inputs = generateCircuitInputs(birthDate, keys.publicKey.address || '0x1234567890123456789012345678901234567890')
      
      setProgress('Generating zero-knowledge proof...')
      
      // Generate proof using SnarkJS
      const proofResult = await generateProof(inputs, circuit)
      
      setProof(proofResult.proof)
      setPublicSignals(proofResult.publicSignals)
      
      // Store in context
      updateZKState('proof', {
        proof: proofResult.proof,
        publicSignals: proofResult.publicSignals,
        inputs: inputs,
        timestamp: Date.now()
      })
      
      completeStep('proof')
      setProgress('')
      
    } catch (err) {
      setError(`Proof generation failed: ${err.message}`)
      setProgress('')
    } finally {
      setIsGenerating(false)
    }
  }, [circuit, birthDate, keys, updateZKState, completeStep])

  const handleVerifyProof = useCallback(async () => {
    if (!proof || !publicSignals) {
      setError('No proof to verify. Generate proof first.')
      return
    }

    setIsVerifying(true)
    setError(null)
    setProgress('Loading verification key...')

    try {
      const verificationKey = await loadVerificationKey()
      
      setProgress('Verifying proof...')
      const isValid = await verifyProof(proof, publicSignals, verificationKey)
      
      setVerificationResult({
        isValid,
        timestamp: Date.now(),
        details: isValid ? parsePublicSignals(publicSignals) : null
      })
      
      setProgress('')
      
    } catch (err) {
      setError(`Verification failed: ${err.message}`)
      setProgress('')
    } finally {
      setIsVerifying(false)
    }
  }, [proof, publicSignals])

  if (!circuit || !birthDate || !keys) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-400 mb-2">Prerequisites Required</h3>
        <p className="text-gray-500">Please complete all previous steps first</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-cyber-primary mb-2">
          Generate Zero-Knowledge Proof
        </h2>
        <p className="text-gray-400">
          Create a cryptographic proof that you're over 18 without revealing your exact age
        </p>
      </div>

      {/* Proof Generation */}
      {!proof && (
        <div className="cyber-card p-6">
          <h3 className="text-lg font-semibold text-cyber-primary mb-4">
            Generate Age Proof
          </h3>
          
          <div className="bg-cyber-darker p-4 rounded border border-cyber-primary/20 mb-4">
            <h4 className="font-semibold text-cyber-accent mb-2">What this proof will demonstrate:</h4>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>✓ You are at least 18 years old</li>
              <li>✓ Your identity is authenticated via cryptographic hash</li>
              <li>✗ Your exact age or birth date (kept private)</li>
              <li>✗ Any other personal information</li>
            </ul>
          </div>

          {progress && (
            <div className="mb-4">
              <div className="flex items-center space-x-2 text-cyber-accent">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-cyber-accent"></div>
                <span className="text-sm">{progress}</span>
              </div>
            </div>
          )}

          <button
            onClick={handleGenerateProof}
            disabled={isGenerating}
            className="cyber-button w-full"
          >
            {isGenerating ? 'Generating Proof...' : 'Generate ZK Proof'}
          </button>
        </div>
      )}

      {/* Proof Generated */}
      {proof && (
        <div className="cyber-card p-6 bg-neon-green/10 border-neon-green/30">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-neon-green rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-cyber-dark" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-neon-green">Proof Generated!</h3>
              <p className="text-gray-300">Your zero-knowledge proof is ready for verification</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Public Signals */}
            <div className="bg-cyber-darker p-4 rounded">
              <h4 className="font-semibold text-cyber-accent mb-2">Public Information (Visible to Verifier):</h4>
              <div className="font-mono text-xs space-y-1">
                <div>Address: {publicSignals[0]}</div>
                <div>Timestamp: {new Date(parseInt(publicSignals[1]) * 1000).toLocaleString()}</div>
                <div>Age Threshold: {(parseInt(publicSignals[2]) / (365.25 * 24 * 3600)).toFixed(1)} years</div>
                <div>Hash: {publicSignals[3].slice(0, 16)}...</div>
              </div>
            </div>

            {/* Proof Data Preview */}
            <div className="bg-cyber-darker p-4 rounded">
              <h4 className="font-semibold text-cyber-accent mb-2">Proof Data (Cryptographic):</h4>
              <div className="font-mono text-xs text-gray-400">
                π_a: [{proof.pi_a[0].slice(0, 20)}..., {proof.pi_a[1].slice(0, 20)}...]<br/>
                π_b: [[{proof.pi_b[0][0].slice(0, 16)}..., {proof.pi_b[0][1].slice(0, 16)}...], ...]<br/>
                π_c: [{proof.pi_c[0].slice(0, 20)}..., {proof.pi_c[1].slice(0, 20)}...]
              </div>
            </div>

            {/* Verify Button */}
            <button
              onClick={handleVerifyProof}
              disabled={isVerifying}
              className="cyber-button w-full"
            >
              {isVerifying ? 'Verifying...' : 'Verify Proof'}
            </button>
          </div>
        </div>
      )}

      {/* Verification Result */}
      {verificationResult && (
        <div className={`cyber-card p-6 ${verificationResult.isValid ? 'bg-neon-green/10 border-neon-green/30' : 'bg-red-500/10 border-red-500/30'}`}>
          <div className="flex items-center space-x-3 mb-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${verificationResult.isValid ? 'bg-neon-green' : 'bg-red-500'}`}>
              {verificationResult.isValid ? (
                <svg className="w-5 h-5 text-cyber-dark" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div>
              <h3 className={`text-lg font-semibold ${verificationResult.isValid ? 'text-neon-green' : 'text-red-500'}`}>
                {verificationResult.isValid ? 'Verification Successful!' : 'Verification Failed!'}
              </h3>
              <p className="text-gray-300">
                {verificationResult.isValid 
                  ? 'The proof cryptographically confirms age ≥ 18' 
                  : 'The proof could not be verified'}
              </p>
            </div>
          </div>

          {verificationResult.isValid && verificationResult.details && (
            <div className="bg-cyber-darker p-4 rounded">
              <h4 className="font-semibold text-cyber-accent mb-2">Verification Summary:</h4>
              <p className="text-gray-300 text-sm">{verificationResult.details.summary}</p>
            </div>
          )}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="cyber-card p-6 border-red-500 bg-red-500/10">
          <div className="flex items-start space-x-3">
            <div className="text-2xl">❌</div>
            <div>
              <h3 className="text-lg font-semibold text-red-500 mb-2">Error</h3>
              <p className="text-gray-300">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Educational Information */}
      <div className="cyber-card p-6">
        <h3 className="text-lg font-semibold text-cyber-primary mb-4">
          How Zero-Knowledge Proofs Work
        </h3>
        <div className="space-y-3 text-sm text-gray-300">
          <div className="flex items-start space-x-3">
            <span className="text-cyber-accent">🎭</span>
            <div>
              <strong>Zero-Knowledge:</strong> The proof reveals nothing about your actual age or birth date
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <span className="text-cyber-accent">🔐</span>
            <div>
              <strong>Cryptographic Security:</strong> Uses Groth16 protocol with Poseidon hash function
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <span className="text-cyber-accent">✅</span>
            <div>
              <strong>Verifiable:</strong> Anyone can verify the proof without trusting the prover
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <span className="text-cyber-accent">🛡️</span>
            <div>
              <strong>Privacy:</strong> Only proves the specific claim (age ≥ 18) and nothing more
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 