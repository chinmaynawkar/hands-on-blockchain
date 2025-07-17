import React, { createContext, useReducer, useEffect } from "react";
import type { ReactNode } from "react";

// Types for identity management
export interface DIDDocument {
  id: string;
  verificationMethod: Array<{
    id: string;
    type: string;
    controller: string;
    publicKeyMultibase?: string;
  }>;
  authentication: string[];
  assertionMethod: string[];
  created: string;
}

export interface VerifiableCredential {
  id: string;
  type: string[];
  issuer: string;
  issuanceDate: string;
  credentialSubject: Record<string, unknown>;
  proof: Record<string, unknown>;
}

export interface ZKProof {
  id: string;
  type: string;
  created: string;
  verificationMethod?: string;
  proofPurpose: string;
  data: Record<string, unknown>;
}

export interface IdentityState {
  isInitialized: boolean;
  did: string | null;
  didDocument: DIDDocument | null;
  credentials: VerifiableCredential[];
  isLoading: boolean;
  error: string | null;
  zkProofs: ZKProof[];
}

type IdentityAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_INITIALIZED"; payload: boolean }
  | { type: "SET_DID"; payload: { did: string; didDocument: DIDDocument } }
  | { type: "ADD_CREDENTIAL"; payload: VerifiableCredential }
  | { type: "REMOVE_CREDENTIAL"; payload: string }
  | { type: "ADD_ZK_PROOF"; payload: ZKProof }
  | { type: "RESET_IDENTITY" };

const initialState: IdentityState = {
  isInitialized: false,
  did: null,
  didDocument: null,
  credentials: [],
  isLoading: false,
  error: null,
  zkProofs: [],
};

function identityReducer(
  state: IdentityState,
  action: IdentityAction
): IdentityState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload, isLoading: false };
    case "SET_INITIALIZED":
      return { ...state, isInitialized: action.payload };
    case "SET_DID":
      return {
        ...state,
        did: action.payload.did,
        didDocument: action.payload.didDocument,
        isInitialized: true,
        isLoading: false,
        error: null,
      };
    case "ADD_CREDENTIAL":
      return {
        ...state,
        credentials: [...state.credentials, action.payload],
      };
    case "REMOVE_CREDENTIAL":
      return {
        ...state,
        credentials: state.credentials.filter(
          (cred) => cred.id !== action.payload
        ),
      };
    case "ADD_ZK_PROOF":
      return {
        ...state,
        zkProofs: [...state.zkProofs, action.payload],
      };
    case "RESET_IDENTITY":
      return initialState;
    default:
      return state;
  }
}

interface IdentityContextType {
  state: IdentityState;
  createIdentity: () => Promise<void>;
  addCredential: (credential: VerifiableCredential) => void;
  removeCredential: (credentialId: string) => void;
  generateZKProof: (data: Record<string, unknown>) => Promise<ZKProof>;
  resetIdentity: () => void;
}

export const IdentityContext = createContext<IdentityContextType | undefined>(
  undefined
);

export function IdentityProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(identityReducer, initialState);

  // Load identity from localStorage on mount
  useEffect(() => {
    const loadStoredIdentity = () => {
      try {
        const storedDid = localStorage.getItem("identity_did");
        const storedDidDocument = localStorage.getItem("identity_did_document");
        const storedCredentials = localStorage.getItem("identity_credentials");

        if (storedDid && storedDidDocument) {
          dispatch({
            type: "SET_DID",
            payload: {
              did: storedDid,
              didDocument: JSON.parse(storedDidDocument),
            },
          });
        }

        if (storedCredentials) {
          const credentials = JSON.parse(storedCredentials);
          credentials.forEach((cred: VerifiableCredential) => {
            dispatch({ type: "ADD_CREDENTIAL", payload: cred });
          });
        }
      } catch (error) {
        console.error("Error loading stored identity:", error);
      }
    };

    loadStoredIdentity();
  }, []);

  const createIdentity = async () => {
    dispatch({ type: "SET_LOADING", payload: true });

    try {
      // Generate a new DID using did:ethr method
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 15);
      const did = `did:ethr:0x${randomId}${timestamp.toString(16)}`;

      const didDocument: DIDDocument = {
        id: did,
        verificationMethod: [
          {
            id: `${did}#key-1`,
            type: "EcdsaSecp256k1VerificationKey2019",
            controller: did,
            publicKeyMultibase: `z${randomId}`, // Simplified for demo
          },
        ],
        authentication: [`${did}#key-1`],
        assertionMethod: [`${did}#key-1`],
        created: new Date().toISOString(),
      };

      // Store in localStorage
      localStorage.setItem("identity_did", did);
      localStorage.setItem(
        "identity_did_document",
        JSON.stringify(didDocument)
      );

      dispatch({
        type: "SET_DID",
        payload: { did, didDocument },
      });
    } catch (error) {
      dispatch({
        type: "SET_ERROR",
        payload:
          error instanceof Error ? error.message : "Failed to create identity",
      });
    }
  };

  const addCredential = (credential: VerifiableCredential) => {
    dispatch({ type: "ADD_CREDENTIAL", payload: credential });

    // Update localStorage
    const updatedCredentials = [...state.credentials, credential];
    localStorage.setItem(
      "identity_credentials",
      JSON.stringify(updatedCredentials)
    );
  };

  const removeCredential = (credentialId: string) => {
    dispatch({ type: "REMOVE_CREDENTIAL", payload: credentialId });

    // Update localStorage
    const updatedCredentials = state.credentials.filter(
      (cred) => cred.id !== credentialId
    );
    localStorage.setItem(
      "identity_credentials",
      JSON.stringify(updatedCredentials)
    );
  };

  const generateZKProof = async (
    data: Record<string, unknown>
  ): Promise<ZKProof> => {
    dispatch({ type: "SET_LOADING", payload: true });

    try {
      // This will integrate with our ZK circuit later
      const proof: ZKProof = {
        id: `proof-${Date.now()}`,
        type: "ZKProof",
        created: new Date().toISOString(),
        verificationMethod: state.didDocument?.verificationMethod[0]?.id,
        proofPurpose: "authentication",
        data,
      };

      dispatch({ type: "ADD_ZK_PROOF", payload: proof });
      dispatch({ type: "SET_LOADING", payload: false });

      return proof;
    } catch (error) {
      dispatch({
        type: "SET_ERROR",
        payload:
          error instanceof Error
            ? error.message
            : "Failed to generate ZK proof",
      });
      throw error;
    }
  };

  const resetIdentity = () => {
    localStorage.removeItem("identity_did");
    localStorage.removeItem("identity_did_document");
    localStorage.removeItem("identity_credentials");
    dispatch({ type: "RESET_IDENTITY" });
  };

  const value: IdentityContextType = {
    state,
    createIdentity,
    addCredential,
    removeCredential,
    generateZKProof,
    resetIdentity,
  };

  return (
    <IdentityContext.Provider value={value}>
      {children}
    </IdentityContext.Provider>
  );
}
