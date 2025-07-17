import React, { useState } from "react";
import { useIdentity } from "../hooks/useIdentity";
import {
  UserCircleIcon,
  KeyIcon,
  ClipboardDocumentIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

export function IdentitySetup() {
  const { state, createIdentity, resetIdentity } = useIdentity();
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateIdentity = async () => {
    setIsCreating(true);
    try {
      await createIdentity();
    } catch (error) {
      console.error("Failed to create identity:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleResetIdentity = () => {
    if (
      window.confirm(
        "Are you sure you want to reset your identity? This action cannot be undone."
      )
    ) {
      resetIdentity();
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Identity Setup</h1>
        <p className="mt-2 text-sm text-gray-600">
          Create and manage your decentralized identity (DID)
        </p>
      </div>

      {state.error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-700">{state.error}</div>
        </div>
      )}

      {!state.isInitialized ? (
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-8 text-center">
            <UserCircleIcon className="mx-auto h-16 w-16 text-gray-400" />
            <h2 className="mt-4 text-xl font-semibold text-gray-900">
              Create Your Identity
            </h2>
            <p className="mt-2 text-sm text-gray-600 max-w-md mx-auto">
              A decentralized identity (DID) is your unique identifier on the
              blockchain. It allows you to prove your identity without relying
              on centralized authorities.
            </p>
            <div className="mt-8">
              <button
                onClick={handleCreateIdentity}
                disabled={isCreating || state.isLoading}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreating || state.isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <KeyIcon className="h-5 w-5 mr-2" />
                    Create Identity
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Identity Information */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">
                Identity Information
              </h2>
            </div>
            <div className="px-6 py-4 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Decentralized Identifier (DID)
                </label>
                <div className="mt-1 flex items-center space-x-2">
                  <input
                    type="text"
                    value={state.did || ""}
                    readOnly
                    className="flex-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm font-mono"
                  />
                  <button
                    onClick={() => copyToClipboard(state.did || "")}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    <ClipboardDocumentIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Created
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    value={
                      state.didDocument?.created
                        ? new Date(state.didDocument.created).toLocaleString()
                        : "Unknown"
                    }
                    readOnly
                    className="block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Verification Methods */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">
                Verification Methods
              </h2>
            </div>
            <div className="px-6 py-4">
              {state.didDocument?.verificationMethod.map((method, index) => (
                <div
                  key={method.id}
                  className="border rounded-lg p-4 mb-4 last:mb-0"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <KeyIcon className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-900">
                        Key #{index + 1}
                      </span>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Active
                    </span>
                  </div>
                  <div className="mt-2 space-y-2">
                    <div>
                      <span className="text-xs text-gray-500">ID:</span>
                      <p className="text-sm font-mono text-gray-900 break-all">
                        {method.id}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">Type:</span>
                      <p className="text-sm text-gray-900">{method.type}</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">Controller:</span>
                      <p className="text-sm font-mono text-gray-900 break-all">
                        {method.controller}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* DID Document */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">
                DID Document
              </h2>
            </div>
            <div className="px-6 py-4">
              <pre className="text-xs text-gray-900 bg-gray-50 rounded-md p-4 overflow-x-auto">
                {JSON.stringify(state.didDocument, null, 2)}
              </pre>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-white shadow rounded-lg border border-red-200">
            <div className="px-6 py-4 border-b border-red-200">
              <h2 className="text-lg font-medium text-red-900">Danger Zone</h2>
            </div>
            <div className="px-6 py-4">
              <p className="text-sm text-red-600 mb-4">
                Resetting your identity will permanently delete your DID and all
                associated data. This action cannot be undone.
              </p>
              <button
                onClick={handleResetIdentity}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <TrashIcon className="h-4 w-4 mr-2" />
                Reset Identity
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
