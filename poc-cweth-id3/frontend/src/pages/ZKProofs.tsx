import React, { useState } from "react";
import { useIdentity } from "../hooks/useIdentity";
import {
  ShieldCheckIcon,
  PlusIcon,
  EyeIcon,
  ClipboardDocumentIcon,
} from "@heroicons/react/24/outline";

export function ZKProofs() {
  const { state, generateZKProof } = useIdentity();
  const [showGenerateForm, setShowGenerateForm] = useState(false);
  const [selectedProof, setSelectedProof] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateProof = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setIsGenerating(true);

    try {
      const formData = new FormData(event.currentTarget);
      const proofData = {
        type: formData.get("proofType") as string,
        statement: formData.get("statement") as string,
        publicInputs: formData.get("publicInputs") as string,
        privateInputs: formData.get("privateInputs") as string,
      };

      await generateZKProof(proofData);
      setShowGenerateForm(false);
    } catch (error) {
      console.error("Failed to generate proof:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (!state.isInitialized) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">ZK Proofs</h1>
          <p className="mt-2 text-sm text-gray-600">
            Generate and manage zero-knowledge proofs
          </p>
        </div>

        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-8 text-center">
            <ShieldCheckIcon className="mx-auto h-16 w-16 text-gray-400" />
            <h2 className="mt-4 text-xl font-semibold text-gray-900">
              Identity Required
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              You need to create an identity before you can generate ZK proofs.
            </p>
            <div className="mt-6">
              <button
                onClick={() => (window.location.href = "/identity")}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Create Identity
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <button
        className="demo-btn"
        onClick={() => alert("Demo Button Clicked!")}
      >
        Demo Button
      </button>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">ZK Proofs</h1>
            <p className="mt-2 text-sm text-gray-600">
              Generate and manage zero-knowledge proofs for privacy-preserving
              authentication
            </p>
          </div>
          <button
            onClick={() => setShowGenerateForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Generate Proof
          </button>
        </div>

        {/* Generate Proof Form */}
        {showGenerateForm && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">
                Generate ZK Proof
              </h2>
            </div>
            <form
              onSubmit={handleGenerateProof}
              className="px-6 py-4 space-y-4"
            >
              <div>
                <label
                  htmlFor="proofType"
                  className="block text-sm font-medium text-gray-700"
                >
                  Proof Type
                </label>
                <select
                  id="proofType"
                  name="proofType"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                >
                  <option value="">Select a proof type</option>
                  <option value="age">Age Verification</option>
                  <option value="membership">Membership Proof</option>
                  <option value="balance">Balance Proof</option>
                  <option value="identity">Identity Proof</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="statement"
                  className="block text-sm font-medium text-gray-700"
                >
                  Statement to Prove
                </label>
                <textarea
                  id="statement"
                  name="statement"
                  rows={3}
                  required
                  placeholder="e.g., I am over 18 years old"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                />
              </div>

              <div>
                <label
                  htmlFor="publicInputs"
                  className="block text-sm font-medium text-gray-700"
                >
                  Public Inputs (JSON)
                </label>
                <textarea
                  id="publicInputs"
                  name="publicInputs"
                  rows={3}
                  placeholder='{"minAge": 18, "currentTime": "2024-01-01"}'
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm font-mono"
                />
              </div>

              <div>
                <label
                  htmlFor="privateInputs"
                  className="block text-sm font-medium text-gray-700"
                >
                  Private Inputs (JSON)
                </label>
                <textarea
                  id="privateInputs"
                  name="privateInputs"
                  rows={3}
                  placeholder='{"birthDate": "1990-01-01", "secret": "my-secret"}'
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm font-mono"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <p className="text-sm text-blue-700">
                  <strong>Note:</strong> This is a demonstration. Actual ZK
                  circuit integration will use the compiled circuits from our
                  POC.
                </p>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowGenerateForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
                      Generating...
                    </>
                  ) : (
                    "Generate Proof"
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Proofs List */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              Generated Proofs
            </h2>
          </div>
          <div className="px-6 py-4">
            {state.zkProofs.length === 0 ? (
              <div className="text-center py-8">
                <ShieldCheckIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No proofs generated
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Generate your first zero-knowledge proof to get started.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {state.zkProofs.map((proof) => (
                  <div key={proof.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <ShieldCheckIcon className="h-5 w-5 text-green-500 mr-3" />
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">
                            {proof.type} Proof
                          </h3>
                          <p className="text-xs text-gray-500">
                            Generated:{" "}
                            {new Date(proof.created).toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500">
                            Purpose: {proof.proofPurpose}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setSelectedProof(proof)}
                          className="inline-flex items-center px-2 py-1 border border-gray-300 rounded text-xs font-medium text-gray-700 bg-white hover:bg-gray-50"
                        >
                          <EyeIcon className="h-3 w-3 mr-1" />
                          View
                        </button>
                        <button
                          onClick={() =>
                            copyToClipboard(JSON.stringify(proof, null, 2))
                          }
                          className="inline-flex items-center px-2 py-1 border border-gray-300 rounded text-xs font-medium text-gray-700 bg-white hover:bg-gray-50"
                        >
                          <ClipboardDocumentIcon className="h-3 w-3 mr-1" />
                          Copy
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Proof Detail Modal */}
        {selectedProof && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    ZK Proof Details
                  </h3>
                  <button
                    onClick={() => setSelectedProof(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>
                <pre className="text-xs text-gray-900 bg-gray-50 rounded-md p-4 overflow-x-auto">
                  {JSON.stringify(selectedProof, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* Circuit Integration Status */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              Circuit Integration Status
            </h2>
          </div>
          <div className="px-6 py-4">
            <div className="space-y-3">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-900">
                    Multiplier Circuit - Compiled & Ready
                  </p>
                  <p className="text-xs text-gray-500">
                    Basic ZK proof generation working
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-900">
                    Age Verification Circuit - In Development
                  </p>
                  <p className="text-xs text-gray-500">
                    Next phase implementation
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-900">
                    cWETH Balance Circuit - In Development
                  </p>
                  <p className="text-xs text-gray-500">
                    Next phase implementation
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
