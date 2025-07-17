import React, { useState } from "react";
import { useIdentity } from "../hooks/useIdentity";
import {
  CurrencyDollarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  EyeIcon,
  EyeSlashIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";

export function CWETHWallet() {
  const { state } = useIdentity();
  const [showBalance, setShowBalance] = useState(false);
  const [showDepositForm, setShowDepositForm] = useState(false);
  const [showWithdrawForm, setShowWithdrawForm] = useState(false);

  // Mock data for demonstration
  const balance = {
    public: "0.00",
    private: "0.00",
    total: "0.00",
  };

  const transactions = [
    // Mock transactions will be added here
  ];

  const handleDeposit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // This will integrate with the cWETH contract later
    console.log("Deposit functionality coming soon");
    setShowDepositForm(false);
  };

  const handleWithdraw = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // This will integrate with the cWETH contract later
    console.log("Withdraw functionality coming soon");
    setShowWithdrawForm(false);
  };

  if (!state.isInitialized) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">cWETH Wallet</h1>
          <p className="mt-2 text-sm text-gray-600">
            Confidential Wrapped Ethereum wallet
          </p>
        </div>

        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-8 text-center">
            <CurrencyDollarIcon className="mx-auto h-16 w-16 text-gray-400" />
            <h2 className="mt-4 text-xl font-semibold text-gray-900">
              Identity Required
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              You need to create an identity before you can use the cWETH
              wallet.
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
        <div>
          <h1 className="text-3xl font-bold text-gray-900">cWETH Wallet</h1>
          <p className="mt-2 text-sm text-gray-600">
            Confidential Wrapped Ethereum wallet with zero-knowledge privacy
          </p>
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CurrencyDollarIcon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Public Balance
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {balance.public} ETH
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ShieldCheckIcon className="h-6 w-6 text-purple-500" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Private Balance
                    </dt>
                    <dd className="text-lg font-medium text-gray-900 flex items-center">
                      {showBalance ? `${balance.private} ETH` : "••••••••"}
                      <button
                        onClick={() => setShowBalance(!showBalance)}
                        className="ml-2 text-gray-400 hover:text-gray-600"
                      >
                        {showBalance ? (
                          <EyeSlashIcon className="h-4 w-4" />
                        ) : (
                          <EyeIcon className="h-4 w-4" />
                        )}
                      </button>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CurrencyDollarIcon className="h-6 w-6 text-green-500" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Balance
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {balance.total} ETH
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4">
          <button
            onClick={() => setShowDepositForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <ArrowDownIcon className="h-4 w-4 mr-2" />
            Deposit
          </button>
          <button
            onClick={() => setShowWithdrawForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <ArrowUpIcon className="h-4 w-4 mr-2" />
            Withdraw
          </button>
        </div>

        {/* Deposit Form */}
        {showDepositForm && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Deposit ETH</h2>
            </div>
            <form onSubmit={handleDeposit} className="px-6 py-4 space-y-4">
              <div>
                <label
                  htmlFor="depositAmount"
                  className="block text-sm font-medium text-gray-700"
                >
                  Amount (ETH)
                </label>
                <input
                  type="number"
                  id="depositAmount"
                  name="depositAmount"
                  step="0.001"
                  min="0"
                  required
                  placeholder="0.00"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="makePrivate"
                    className="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Make this deposit private (uses zero-knowledge proofs)
                  </span>
                </label>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <p className="text-sm text-blue-700">
                  <strong>Note:</strong> This is a demonstration. Actual cWETH
                  integration will be implemented in the next phase.
                </p>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowDepositForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Deposit
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Withdraw Form */}
        {showWithdrawForm && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">
                Withdraw ETH
              </h2>
            </div>
            <form onSubmit={handleWithdraw} className="px-6 py-4 space-y-4">
              <div>
                <label
                  htmlFor="withdrawAmount"
                  className="block text-sm font-medium text-gray-700"
                >
                  Amount (ETH)
                </label>
                <input
                  type="number"
                  id="withdrawAmount"
                  name="withdrawAmount"
                  step="0.001"
                  min="0"
                  required
                  placeholder="0.00"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                />
              </div>

              <div>
                <label
                  htmlFor="withdrawTo"
                  className="block text-sm font-medium text-gray-700"
                >
                  Withdraw to Address
                </label>
                <input
                  type="text"
                  id="withdrawTo"
                  name="withdrawTo"
                  required
                  placeholder="0x..."
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <p className="text-sm text-blue-700">
                  <strong>Note:</strong> This is a demonstration. Actual cWETH
                  integration will be implemented in the next phase.
                </p>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowWithdrawForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Withdraw
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Transaction History */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              Transaction History
            </h2>
          </div>
          <div className="px-6 py-4">
            {transactions.length === 0 ? (
              <div className="text-center py-8">
                <CurrencyDollarIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No transactions
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Your transaction history will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Transaction items will be rendered here */}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
