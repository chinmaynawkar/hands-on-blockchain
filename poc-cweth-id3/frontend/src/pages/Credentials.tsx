import React, { useState } from "react";
import { useIdentity } from "../hooks/useIdentity";
import {
  DocumentTextIcon,
  PlusIcon,
  TrashIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import type { VerifiableCredential } from "../contexts/IdentityContext";

export function Credentials() {
  const { state, addCredential, removeCredential } = useIdentity();
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedCredential, setSelectedCredential] =
    useState<VerifiableCredential | null>(null);

  const handleAddCredential = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    const credential: VerifiableCredential = {
      id: `credential-${Date.now()}`,
      type: ["VerifiableCredential", formData.get("type") as string],
      issuer: formData.get("issuer") as string,
      issuanceDate: new Date().toISOString(),
      credentialSubject: {
        id: state.did,
        [formData.get("claimType") as string]: formData.get(
          "claimValue"
        ) as string,
      },
      proof: {
        type: "Ed25519Signature2018",
        created: new Date().toISOString(),
        proofPurpose: "assertionMethod",
        verificationMethod: state.didDocument?.verificationMethod[0]?.id,
      },
    };

    addCredential(credential);
    setShowAddForm(false);
  };

  const handleRemoveCredential = (credentialId: string) => {
    if (window.confirm("Are you sure you want to remove this credential?")) {
      removeCredential(credentialId);
    }
  };

  if (!state.isInitialized) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Credentials</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage your verifiable credentials
          </p>
        </div>

        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-8 text-center">
            <DocumentTextIcon className="mx-auto h-16 w-16 text-gray-400" />
            <h2 className="mt-4 text-xl font-semibold text-gray-900">
              Identity Required
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              You need to create an identity before you can manage credentials.
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
            <h1 className="text-3xl font-bold text-gray-900">Credentials</h1>
            <p className="mt-2 text-sm text-gray-600">
              Manage your verifiable credentials
            </p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Credential
          </button>
        </div>

        {/* Add Credential Form */}
        {showAddForm && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">
                Add New Credential
              </h2>
            </div>
            <form
              onSubmit={handleAddCredential}
              className="px-6 py-4 space-y-4"
            >
              <div>
                <label
                  htmlFor="type"
                  className="block text-sm font-medium text-gray-700"
                >
                  Credential Type
                </label>
                <select
                  id="type"
                  name="type"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                >
                  <option value="">Select a type</option>
                  <option value="EducationCredential">
                    Education Credential
                  </option>
                  <option value="EmploymentCredential">
                    Employment Credential
                  </option>
                  <option value="IdentityCredential">
                    Identity Credential
                  </option>
                  <option value="AgeCredential">Age Credential</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="issuer"
                  className="block text-sm font-medium text-gray-700"
                >
                  Issuer
                </label>
                <input
                  type="text"
                  id="issuer"
                  name="issuer"
                  required
                  placeholder="did:example:issuer123"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                />
              </div>

              <div>
                <label
                  htmlFor="claimType"
                  className="block text-sm font-medium text-gray-700"
                >
                  Claim Type
                </label>
                <input
                  type="text"
                  id="claimType"
                  name="claimType"
                  required
                  placeholder="degree, position, age, etc."
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                />
              </div>

              <div>
                <label
                  htmlFor="claimValue"
                  className="block text-sm font-medium text-gray-700"
                >
                  Claim Value
                </label>
                <input
                  type="text"
                  id="claimValue"
                  name="claimValue"
                  required
                  placeholder="Bachelor of Science, Software Engineer, 25, etc."
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Add Credential
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Credentials List */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              Your Credentials
            </h2>
          </div>
          <div className="px-6 py-4">
            {state.credentials.length === 0 ? (
              <div className="text-center py-8">
                <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No credentials
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Get started by adding your first credential.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {state.credentials.map((credential) => (
                  <div key={credential.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <DocumentTextIcon className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">
                            {credential.type
                              .filter((t) => t !== "VerifiableCredential")
                              .join(", ")}
                          </h3>
                          <p className="text-xs text-gray-500">
                            Issued by: {credential.issuer}
                          </p>
                          <p className="text-xs text-gray-500">
                            Date:{" "}
                            {new Date(
                              credential.issuanceDate
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setSelectedCredential(credential)}
                          className="inline-flex items-center px-2 py-1 border border-gray-300 rounded text-xs font-medium text-gray-700 bg-white hover:bg-gray-50"
                        >
                          <EyeIcon className="h-3 w-3 mr-1" />
                          View
                        </button>
                        <button
                          onClick={() => handleRemoveCredential(credential.id)}
                          className="inline-flex items-center px-2 py-1 border border-red-300 rounded text-xs font-medium text-red-700 bg-white hover:bg-red-50"
                        >
                          <TrashIcon className="h-3 w-3 mr-1" />
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Credential Detail Modal */}
        {selectedCredential && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Credential Details
                  </h3>
                  <button
                    onClick={() => setSelectedCredential(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>
                <pre className="text-xs text-gray-900 bg-gray-50 rounded-md p-4 overflow-x-auto">
                  {JSON.stringify(selectedCredential, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
