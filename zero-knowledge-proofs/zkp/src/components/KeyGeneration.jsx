import React, { useState, useCallback } from 'react'
import { useZK } from '../context/ZKContext'
import { generateBabyJubJubKeys, validateKeys } from '../utils/cryptography'

export function KeyGeneration() {
  const { keys, updateZKState, completeStep } = useZK()
  const [isGenerating, setIsGenerating] = useState(false)
  const [showPrivateKey, setShowPrivateKey] = useState(false)
  const [error, setError] = useState(null)

  const handleGenerateKeys = useCallback(async () => {
    setIsGenerating(true)
    setError(null)

    try {
      // Generate BabyJubJub keypair
      const keyPair = await generateBabyJubJubKeys()
      
      // Validate the generated keys
      const isValid = await validateKeys(keyPair)
      if (!isValid) {
        throw new Error('Generated keys failed validation')
      }

      updateZKState('keys', keyPair)
      completeStep('keys')
    } catch (err) {
      setError(`Key generation failed: ${err.message}`)
      console.error('Key generation error:', err)
    } finally {
      setIsGenerating(false)
    }
  }, [updateZKState, completeStep])

  const handleExportKeys = useCallback(() => {
    if (!keys) return

    const keyData = {
      publicKey: {
        x: keys.publicKey.x,
        y: keys.publicKey.y
      },
      privateKey: keys.privateKey,
      timestamp: Date.now()
    }

    const blob = new Blob([JSON.stringify(keyData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `zkage-keys-${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [keys])

  const handleImportKeys = useCallback((event) => {
    const file = event.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const keyData = JSON.parse(e.target.result)
        
        // Validate imported keys
        const isValid = await validateKeys(keyData)
        if (!isValid) {
          throw new Error('Imported keys are invalid')
        }

        updateZKState('keys', keyData)
        completeStep('keys')
      } catch (err) {
        setError(`Key import failed: ${err.message}`)
      }
    }
    reader.readAsText(file)
  }, [updateZKState, completeStep])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-cyber-primary mb-2">
          Generate BabyJubJub Keys
        </h2>
        <p className="text-gray-400">
          Create a cryptographically secure keypair for age verification
        </p>
      </div>

      {/* Key Generation */}
      {!keys ? (
        <div className="space-y-4">
          <div className="bg-cyber-dark/30 border border-cyber-primary/20 rounded-lg p-6 text-center">
            <div className="mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-cyber-primary to-cyber-accent rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-cyber-dark" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-0.257-0.257A6 6 0 1118 8zM2 8a6 6 0 1010.898 5.17L12 14l-0.898-0.83A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Ready to Generate Keys
              </h3>
              <p className="text-gray-400 text-sm">
                Your private key will be generated securely in your browser and never transmitted
              </p>
            </div>

            <button
              onClick={handleGenerateKeys}
              disabled={isGenerating}
              className="cyber-button"
            >
              {isGenerating ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-cyber-primary"></div>
                  <span>Generating Keys...</span>
                </div>
              ) : (
                'Generate Keys'
              )}
            </button>
          </div>

          {/* Import Option */}
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-2">Or import existing keys</p>
            <label className="cyber-button cursor-pointer inline-block">
              <input
                type="file"
                accept=".json"
                onChange={handleImportKeys}
                className="hidden"
              />
              Import Keys
            </label>
          </div>
        </div>
      ) : (
        /* Key Display */
        <div className="space-y-4">
          <div className="bg-neon-green/10 border border-neon-green/30 rounded-lg p-6">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-6 h-6 bg-neon-green rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-cyber-dark" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-neon-green">Keys Generated Successfully</h3>
            </div>

            {/* Public Key */}
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Public Key (X)
                </label>
                <div className="cyber-input font-mono text-xs break-all">
                  {keys.publicKey.x}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Public Key (Y)
                </label>
                <div className="cyber-input font-mono text-xs break-all">
                  {keys.publicKey.y}
                </div>
              </div>

              {/* Private Key */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Private Key
                  </label>
                  <button
                    onClick={() => setShowPrivateKey(!showPrivateKey)}
                    className="text-xs text-cyber-primary hover:text-cyber-accent transition-colors"
                  >
                    {showPrivateKey ? 'Hide' : 'Show'}
                  </button>
                </div>
                <div className="cyber-input font-mono text-xs break-all">
                  {showPrivateKey ? keys.privateKey : '••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••'}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleExportKeys}
                className="cyber-button flex-1"
              >
                Export Keys
              </button>
              <button
                onClick={handleGenerateKeys}
                className="cyber-button flex-1 bg-cyber-secondary/10 border-cyber-secondary text-cyber-secondary hover:bg-cyber-secondary hover:text-white"
              >
                Regenerate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <h4 className="text-red-400 font-medium">Error</h4>
              <p className="text-red-300 text-sm mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Security Notice */}
      <div className="bg-cyber-warning/10 border border-cyber-warning/30 rounded-lg p-4">
        <div className="flex items-start space-x-2">
          <svg className="w-5 h-5 text-cyber-warning flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <div>
            <h4 className="text-cyber-warning font-medium">Security Notice</h4>
            <p className="text-cyber-warning/80 text-sm mt-1">
              Your private key is generated locally and never leaves your browser. 
              Keep it secure and never share it with anyone.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 