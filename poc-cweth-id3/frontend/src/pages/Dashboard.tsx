import React from "react";
import { useIdentity } from "../hooks/useIdentity";
import {
  UserCircleIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";

export function Dashboard() {
  const { state } = useIdentity();

  const stats = [
    {
      name: "Identity Status",
      value: state.isInitialized ? "Active" : "Not Created",
      icon: UserCircleIcon,
      color: state.isInitialized ? "text-green-600" : "text-red-600",
      bg: state.isInitialized ? "bg-green-100" : "bg-red-100",
    },
    {
      name: "Credentials",
      value: state.credentials.length.toString(),
      icon: DocumentTextIcon,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      name: "ZK Proofs",
      value: state.zkProofs.length.toString(),
      icon: ShieldCheckIcon,
      color: "text-purple-600",
      bg: "bg-purple-100",
    },
    {
      name: "cWETH Balance",
      value: "0.00 ETH",
      icon: CurrencyDollarIcon,
      color: "text-indigo-600",
      bg: "bg-indigo-100",
    },
  ];

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
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-sm text-gray-600">
            Welcome to your cWETH Identity Wallet
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.name}
              className="relative overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:px-6"
            >
              <div className="flex items-center">
                <div className={`flex-shrink-0 rounded-md p-3 ${stat.bg}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="ml-4 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.name}
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stat.value}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Identity Overview */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              Identity Overview
            </h2>
          </div>
          <div className="px-6 py-4">
            {state.isInitialized ? (
              <div className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">DID</dt>
                  <dd className="mt-1 text-sm text-gray-900 font-mono break-all">
                    {state.did}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Created</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {state.didDocument?.created
                      ? new Date(state.didDocument.created).toLocaleDateString()
                      : "Unknown"}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Verification Methods
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {state.didDocument?.verificationMethod.length || 0} key(s)
                  </dd>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <UserCircleIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No identity created
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Get started by creating your decentralized identity.
                </p>
                <div className="mt-6">
                  <button
                    type="button"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    onClick={() => (window.location.href = "/identity")}
                  >
                    Create Identity
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              Recent Activity
            </h2>
          </div>
          <div className="px-6 py-4">
            <div className="text-center py-8">
              <p className="text-sm text-gray-500">No recent activity</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
