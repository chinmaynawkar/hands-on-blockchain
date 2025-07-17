# Self-Sovereign Identity (SSI): Complete Learning Guide

## Overview (What & Why)

### What is Self-Sovereign Identity?

Self-Sovereign Identity (SSI) is a digital identity model that gives individuals complete control over their personal data and credentials. Instead of relying on centralized authorities (like governments, banks, or tech companies) to manage and verify your identity, SSI puts you in the driver's seat.

**Simple Analogy**: Think of traditional identity like a rental car - the rental company (government/corporation) owns it, controls it, and can take it away. SSI is like owning your own car - you control where it goes, who rides in it, and when to use it.

### Why SSI Matters

**Current Identity Problems**:

- **Data Breaches**: Centralized databases are honeypots for hackers
- **Privacy Loss**: Companies collect and sell your personal data
- **Vendor Lock-in**: Switching platforms means losing your digital identity
- **Access Control**: Governments or companies can delete your accounts
- **Verification Delays**: Manual identity checks slow down processes

**SSI Solutions**:

- **User Control**: You own and control your identity data
- **Privacy Preservation**: Share only what's necessary for each interaction
- **Decentralization**: No single point of failure or control
- **Interoperability**: Works across different platforms and services
- **Verification Speed**: Instant cryptographic proof of credentials

### Real-World Impact

SSI is already being implemented by:

- **US Department of Homeland Security**: Digital immigration credentials
- **European Union**: Digital identity wallets (eIDAS 2.0)
- **Universities**: Tamper-proof digital diplomas
- **Healthcare Systems**: Privacy-preserving health records
- **Supply Chains**: Product authenticity verification

## Core Concepts (The 20% That Matters Most)

### The SSI Technology Stack

```
┌─────────────────┐
│   Digital Wallet │  ← User Interface (Mobile/Web App)
├─────────────────┤
│ Verifiable       │  ← Cryptographically Signed Credentials
│ Credentials (VCs)│
├─────────────────┤
│ Decentralized    │  ← Unique, User-Controlled Identifiers
│ Identifiers (DIDs)│
├─────────────────┤
│ Cryptography     │  ← Digital Signatures, Key Management
│ (Public/Private) │
└─────────────────┘
```

### 1. Decentralized Identifiers (DIDs)

**What**: Unique identifiers that you control, not a company or government.

**Example DID**: `did:ion:EiBVpjUxXeSRJpvj2TewlX9zNF3GKMCKWwGmKBZqF6pk_A`

**Key Properties**:

- **Globally Unique**: No two DIDs are the same
- **Self-Controlled**: Only you have the private key
- **Resolvable**: Can be looked up to find your public key
- **Persistent**: Remains yours permanently

**DID Document Structure**:

```json
{
  "@context": "https://www.w3.org/ns/did/v1",
  "id": "did:example:123456789abcdefghi",
  "verificationMethod": [
    {
      "id": "did:example:123456789abcdefghi#keys-1",
      "type": "EcdsaSecp256k1VerificationKey2019",
      "controller": "did:example:123456789abcdefghi",
      "publicKeyJwk": {
        "kty": "EC",
        "crv": "secp256k1",
        "x": "f83OJ3D2xF1Bg8vub9tLe1gHMzV76e8Tus9uPHvRVEU",
        "y": "x_FEzRu9m36HLN_tue659LNpXW6pCyStikYjKIWI5a0"
      }
    }
  ]
}
```

### 2. Verifiable Credentials (VCs)

**What**: Digital versions of real-world credentials (diploma, driver's license, passport) that are cryptographically signed.

**Structure**:

```json
{
  "@context": [
    "https://www.w3.org/2018/credentials/v1",
    "https://www.w3.org/2018/credentials/examples/v1"
  ],
  "type": ["VerifiableCredential", "UniversityDegreeCredential"],
  "issuer": "did:university:harvard",
  "issuanceDate": "2024-01-01T00:00:00Z",
  "credentialSubject": {
    "id": "did:user:alice",
    "degree": "Bachelor of Science",
    "field": "Computer Science",
    "gpa": "3.8",
    "graduationDate": "2024-05-15"
  },
  "proof": {
    "type": "EcdsaSecp256k1Signature2019",
    "created": "2024-01-01T00:00:00Z",
    "verificationMethod": "did:university:harvard#keys-1",
    "signature": "eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 3. The Three-Party Model

```
    Issuer                    Holder                   Verifier
(University)               (Graduate)               (Employer)
     │                        │                        │
     │ 1. Issues Credential   │                        │
     │───────────────────────►│                        │
     │                        │ 2. Presents Credential │
     │                        │───────────────────────►│
     │                        │                        │
     │ 3. Verifies Signature  │                        │
     │◄───────────────────────┼───────────────────────►│
```

**Roles Explained**:

- **Issuer**: Creates and signs credentials (universities, governments, employers)
- **Holder**: Owns and presents credentials (individuals, organizations)
- **Verifier**: Checks and validates credentials (employers, services, authorities)

### 4. Digital Wallets

**What**: Apps that store your DIDs, credentials, and private keys.

**Key Features**:

- Secure key storage
- Credential management
- Selective disclosure
- Backup and recovery

**Examples**:

- **Microsoft Authenticator**: Enterprise SSI wallet
- **Trinsic Wallet**: General-purpose SSI wallet
- **Hyperledger Aries**: Open-source wallet framework

## Step-by-Step Implementation

### Phase 1: Understanding the Cryptography

**Building Block: Digital Signatures**

```javascript
// 1. Generate a key pair (this happens once)
const keyPair = await crypto.subtle.generateKey(
  {
    name: "ECDSA",
    namedCurve: "P-256",
  },
  true,
  ["sign", "verify"]
);

// 2. Create a credential (University signs Alice's diploma)
const credential = {
  issuer: "did:university:harvard",
  subject: "did:user:alice",
  degree: "Computer Science PhD",
};

// 3. Sign the credential
const signature = await crypto.subtle.sign(
  { name: "ECDSA", hash: "SHA-256" },
  keyPair.privateKey,
  new TextEncoder().encode(JSON.stringify(credential))
);

// 4. Verify the credential (Employer checks the diploma)
const isValid = await crypto.subtle.verify(
  { name: "ECDSA", hash: "SHA-256" },
  keyPair.publicKey,
  signature,
  new TextEncoder().encode(JSON.stringify(credential))
);

console.log("Credential is valid:", isValid);
```

### Phase 2: DID Implementation

**Creating Your First DID**

```javascript
// Simple DID implementation
class SimpleDID {
  constructor() {
    this.keyPair = null;
    this.did = null;
    this.didDocument = null;
  }

  async generateDID() {
    // 1. Generate cryptographic key pair
    this.keyPair = await crypto.subtle.generateKey(
      {
        name: "ECDSA",
        namedCurve: "P-256",
      },
      true,
      ["sign", "verify"]
    );

    // 2. Create DID from public key
    const publicKeyBytes = await crypto.subtle.exportKey(
      "raw",
      this.keyPair.publicKey
    );

    const hash = await crypto.subtle.digest("SHA-256", publicKeyBytes);
    const didSuffix = btoa(String.fromCharCode(...new Uint8Array(hash)))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=/g, "");

    this.did = `did:simple:${didSuffix}`;

    // 3. Create DID Document
    await this.createDIDDocument();

    return this.did;
  }

  async createDIDDocument() {
    const publicKeyJwk = await crypto.subtle.exportKey(
      "jwk",
      this.keyPair.publicKey
    );

    this.didDocument = {
      "@context": "https://www.w3.org/ns/did/v1",
      id: this.did,
      verificationMethod: [
        {
          id: `${this.did}#keys-1`,
          type: "EcdsaSecp256k1VerificationKey2019",
          controller: this.did,
          publicKeyJwk: publicKeyJwk,
        },
      ],
      authentication: [`${this.did}#keys-1`],
      assertionMethod: [`${this.did}#keys-1`],
    };
  }

  async signData(data) {
    const signature = await crypto.subtle.sign(
      { name: "ECDSA", hash: "SHA-256" },
      this.keyPair.privateKey,
      new TextEncoder().encode(JSON.stringify(data))
    );
    return signature;
  }

  getDIDDocument() {
    return this.didDocument;
  }
}

// Usage Example
const alice = new SimpleDID();
const aliceDID = await alice.generateDID();
console.log("Alice's DID:", aliceDID);
console.log("Alice's DID Document:", alice.getDIDDocument());
// Output:
// Alice's DID: did:simple:r3kj2n9fj3kf93jf...
// Alice's DID Document: { "@context": "https://www.w3.org/ns/did/v1", ... }
```

### Phase 3: Verifiable Credentials

**Creating and Verifying Credentials**

```javascript
class VerifiableCredential {
  constructor(issuerDID, subjectDID) {
    this.issuer = issuerDID;
    this.subject = subjectDID;
    this.credential = null;
    this.signature = null;
  }

  async issueCredential(credentialData, issuerPrivateKey) {
    // 1. Create credential structure
    this.credential = {
      "@context": [
        "https://www.w3.org/2018/credentials/v1",
        "https://www.w3.org/2018/credentials/examples/v1",
      ],
      type: ["VerifiableCredential"],
      issuer: this.issuer,
      issuanceDate: new Date().toISOString(),
      credentialSubject: {
        id: this.subject,
        ...credentialData,
      },
    };

    // 2. Sign the credential
    this.signature = await crypto.subtle.sign(
      { name: "ECDSA", hash: "SHA-256" },
      issuerPrivateKey,
      new TextEncoder().encode(JSON.stringify(this.credential))
    );

    return {
      ...this.credential,
      proof: {
        type: "EcdsaSecp256k1Signature2019",
        created: new Date().toISOString(),
        verificationMethod: `${this.issuer}#keys-1`,
        signature: btoa(String.fromCharCode(...new Uint8Array(this.signature))),
      },
    };
  }

  async verifyCredential(verifiableCredential, issuerPublicKey) {
    // 1. Extract credential and signature
    const { proof, ...credential } = verifiableCredential;
    const signature = Uint8Array.from(atob(proof.signature), (c) =>
      c.charCodeAt(0)
    );

    // 2. Verify the signature
    const isValid = await crypto.subtle.verify(
      { name: "ECDSA", hash: "SHA-256" },
      issuerPublicKey,
      signature,
      new TextEncoder().encode(JSON.stringify(credential))
    );

    // 3. Additional validations
    const now = new Date();
    const issuanceDate = new Date(credential.issuanceDate);
    const isNotExpired =
      !credential.expirationDate || now < new Date(credential.expirationDate);

    return {
      isValid: isValid && isNotExpired,
      signatureValid: isValid,
      notExpired: isNotExpired,
      issuer: credential.issuer,
      subject: credential.credentialSubject.id,
    };
  }
}

// Usage Example
async function demonstrateCredentials() {
  // Create entities
  const university = new SimpleDID();
  const alice = new SimpleDID();

  await university.generateDID();
  await alice.generateDID();

  console.log("University DID:", university.did);
  console.log("Alice DID:", alice.did);

  // University issues Alice a diploma
  const diploma = new VerifiableCredential(university.did, alice.did);
  const verifiableCredential = await diploma.issueCredential(
    {
      degree: "PhD in Computer Science",
      university: "Harvard University",
      graduationDate: "2024-05-15",
      gpa: "3.9",
    },
    university.keyPair.privateKey
  );

  console.log("Issued Credential:", verifiableCredential);

  // Employer verifies Alice's diploma
  const verification = await diploma.verifyCredential(
    verifiableCredential,
    university.keyPair.publicKey
  );

  console.log("Verification Result:", verification);
  // Output: { isValid: true, signatureValid: true, notExpired: true, ... }
}

demonstrateCredentials();
```

### Phase 4: Selective Disclosure

**Privacy-Preserving Credential Sharing**

```javascript
class SelectiveDisclosure {
  static createPresentation(verifiableCredential, fieldsToReveal, holderDID) {
    const { credentialSubject, ...credential } = verifiableCredential;

    // Create presentation with only requested fields
    const presentation = {
      "@context": [
        "https://www.w3.org/2018/credentials/v1",
        "https://www.w3.org/2018/presentations/v1",
      ],
      type: ["VerifiablePresentation"],
      holder: holderDID,
      verifiableCredential: [
        {
          ...credential,
          credentialSubject: {
            id: credentialSubject.id,
            ...this.selectFields(credentialSubject, fieldsToReveal),
          },
        },
      ],
    };

    return presentation;
  }

  static selectFields(credentialSubject, fieldsToReveal) {
    const selectedData = {};
    fieldsToReveal.forEach((field) => {
      if (credentialSubject[field] !== undefined) {
        selectedData[field] = credentialSubject[field];
      }
    });
    return selectedData;
  }

  static getFieldsFromPresentation(presentation) {
    const credential = presentation.verifiableCredential[0];
    return Object.keys(credential.credentialSubject).filter(
      (key) => key !== "id"
    );
  }
}

// Usage Examples
async function demonstrateSelectiveDisclosure() {
  // Create complete credential
  const university = new SimpleDID();
  const alice = new SimpleDID();

  await university.generateDID();
  await alice.generateDID();

  const diploma = new VerifiableCredential(university.did, alice.did);
  const fullCredential = await diploma.issueCredential(
    {
      degree: "PhD in Computer Science",
      university: "Harvard University",
      graduationDate: "2024-05-15",
      gpa: "3.9",
      thesis: "Quantum Computing Applications",
    },
    university.keyPair.privateKey
  );

  // Job application: show degree but not GPA
  const jobPresentation = SelectiveDisclosure.createPresentation(
    fullCredential,
    ["degree", "university", "graduationDate"],
    alice.did
  );

  console.log("For Job Application:");
  console.log(
    "Revealed fields:",
    SelectiveDisclosure.getFieldsFromPresentation(jobPresentation)
  );
  // Output: ["degree", "university", "graduationDate"]

  // Graduate school: show everything including GPA
  const gradSchoolPresentation = SelectiveDisclosure.createPresentation(
    fullCredential,
    ["degree", "university", "graduationDate", "gpa", "thesis"],
    alice.did
  );

  console.log("For Graduate School:");
  console.log(
    "Revealed fields:",
    SelectiveDisclosure.getFieldsFromPresentation(gradSchoolPresentation)
  );
  // Output: ["degree", "university", "graduationDate", "gpa", "thesis"]

  // Conference speaker: show degree and thesis only
  const conferencePresentation = SelectiveDisclosure.createPresentation(
    fullCredential,
    ["degree", "thesis"],
    alice.did
  );

  console.log("For Conference:");
  console.log(
    "Revealed fields:",
    SelectiveDisclosure.getFieldsFromPresentation(conferencePresentation)
  );
  // Output: ["degree", "thesis"]
}

demonstrateSelectiveDisclosure();
```

## Real-World Implementation Examples

### 1. Government Digital Identity (DHS Implementation)

**Use Case**: US Immigration documents using W3C standards

```javascript
// Simplified version of DHS approach
class ImmigrationCredential extends VerifiableCredential {
  async issueVisaCredential(visaData, dhs_privateKey) {
    const credentialData = {
      type: ["VerifiableCredential", "ImmigrationCredential"],
      visaType: visaData.visaType,
      employer: visaData.employer,
      validFrom: visaData.validFrom,
      validUntil: visaData.validUntil,
      workAuthorized: visaData.workAuthorized,
      travelAuthorized: visaData.travelAuthorized,
    };

    return await this.issueCredential(credentialData, dhs_privateKey);
  }

  static createEmploymentVerification(visaCredential, holderDID) {
    // For employer verification - only show work authorization
    return SelectiveDisclosure.createPresentation(
      visaCredential,
      ["workAuthorized", "validUntil"],
      holderDID
    );
  }

  static createTravelDocument(visaCredential, holderDID) {
    // For border control - show travel authorization and validity
    return SelectiveDisclosure.createPresentation(
      visaCredential,
      ["travelAuthorized", "validFrom", "validUntil", "visaType"],
      holderDID
    );
  }
}

// Usage
async function demonstrateImmigrationCredential() {
  const dhs = new SimpleDID();
  const immigrant = new SimpleDID();

  await dhs.generateDID();
  await immigrant.generateDID();

  const immigrationCred = new ImmigrationCredential(dhs.did, immigrant.did);

  const visaCredential = await immigrationCred.issueVisaCredential(
    {
      visaType: "H1B",
      employer: "TechCorp Inc",
      validFrom: "2024-01-01",
      validUntil: "2026-12-31",
      workAuthorized: true,
      travelAuthorized: true,
    },
    dhs.keyPair.privateKey
  );

  // For employer verification
  const employmentProof = ImmigrationCredential.createEmploymentVerification(
    visaCredential,
    immigrant.did
  );

  console.log(
    "Employment Verification Fields:",
    SelectiveDisclosure.getFieldsFromPresentation(employmentProof)
  );
  // Output: ["workAuthorized", "validUntil"]

  // For travel
  const travelDocument = ImmigrationCredential.createTravelDocument(
    visaCredential,
    immigrant.did
  );

  console.log(
    "Travel Document Fields:",
    SelectiveDisclosure.getFieldsFromPresentation(travelDocument)
  );
  // Output: ["travelAuthorized", "validFrom", "validUntil", "visaType"]
}
```

### 2. Educational Credentials

**Use Case**: University diplomas with privacy

```javascript
class EducationCredential extends VerifiableCredential {
  async issueDiploma(studentData, university_privateKey) {
    const credentialData = {
      type: ["VerifiableCredential", "EducationCredential"],
      degree: studentData.degree,
      field: studentData.field,
      university: studentData.university,
      gpa: studentData.gpa,
      graduationDate: studentData.graduationDate,
      honors: studentData.honors,
      studentId: studentData.studentId,
    };

    return await this.issueCredential(credentialData, university_privateKey);
  }

  static createJobApplicationProof(diplomaCredential, holderDID) {
    // For job applications - show degree but not GPA or student ID
    return SelectiveDisclosure.createPresentation(
      diplomaCredential,
      ["degree", "field", "university", "graduationDate", "honors"],
      holderDID
    );
  }

  static createGradSchoolApplication(diplomaCredential, holderDID) {
    // For graduate school - show everything including GPA
    return SelectiveDisclosure.createPresentation(
      diplomaCredential,
      ["degree", "field", "university", "gpa", "graduationDate", "honors"],
      holderDID
    );
  }

  static createAlumniVerification(diplomaCredential, holderDID) {
    // For alumni events - just verify graduation
    return SelectiveDisclosure.createPresentation(
      diplomaCredential,
      ["degree", "university", "graduationDate"],
      holderDID
    );
  }
}

// Usage
async function demonstrateEducationCredential() {
  const harvard = new SimpleDID();
  const alice = new SimpleDID();

  await harvard.generateDID();
  await alice.generateDID();

  const educationCred = new EducationCredential(harvard.did, alice.did);

  const diploma = await educationCred.issueDiploma(
    {
      degree: "Master of Science",
      field: "Computer Science",
      university: "Harvard University",
      gpa: "3.9",
      graduationDate: "2024-05-15",
      honors: "Summa Cum Laude",
      studentId: "12345678",
    },
    harvard.keyPair.privateKey
  );

  // Different use cases with different disclosure levels
  const contexts = [
    {
      name: "Job Application",
      presentation: EducationCredential.createJobApplicationProof(
        diploma,
        alice.did
      ),
    },
    {
      name: "Graduate School",
      presentation: EducationCredential.createGradSchoolApplication(
        diploma,
        alice.did
      ),
    },
    {
      name: "Alumni Event",
      presentation: EducationCredential.createAlumniVerification(
        diploma,
        alice.did
      ),
    },
  ];

  contexts.forEach((context) => {
    console.log(
      `${context.name} reveals:`,
      SelectiveDisclosure.getFieldsFromPresentation(context.presentation)
    );
  });

  // Output:
  // Job Application reveals: ["degree", "field", "university", "graduationDate", "honors"]
  // Graduate School reveals: ["degree", "field", "university", "gpa", "graduationDate", "honors"]
  // Alumni Event reveals: ["degree", "university", "graduationDate"]
}
```

### 3. Healthcare Records (COVID-19 Building Access)

**Use Case**: Health verification without revealing medical details

```javascript
class HealthCredential extends VerifiableCredential {
  async issueHealthRecord(healthData, clinic_privateKey) {
    const credentialData = {
      type: ["VerifiableCredential", "HealthCredential"],
      testType: healthData.testType,
      testResult: healthData.testResult,
      testDate: healthData.testDate,
      validUntil: healthData.validUntil,
      labName: healthData.labName,
      buildingAccess: healthData.buildingAccess,
      patientId: healthData.patientId,
    };

    return await this.issueCredential(credentialData, clinic_privateKey);
  }

  static createBuildingAccessProof(healthCredential, holderDID) {
    // For building entry - only reveal access status and validity
    return SelectiveDisclosure.createPresentation(
      healthCredential,
      ["buildingAccess", "validUntil"],
      holderDID
    );
  }

  static createEmployerHealthCheck(healthCredential, holderDID) {
    // For employer - show test type and result but not personal details
    return SelectiveDisclosure.createPresentation(
      healthCredential,
      ["testType", "testResult", "testDate", "buildingAccess"],
      holderDID
    );
  }

  static createMedicalRecord(healthCredential, holderDID) {
    // For medical professionals - show all details
    return SelectiveDisclosure.createPresentation(
      healthCredential,
      [
        "testType",
        "testResult",
        "testDate",
        "validUntil",
        "labName",
        "patientId",
      ],
      holderDID
    );
  }
}

// Usage
async function demonstrateHealthCredential() {
  const cityLab = new SimpleDID();
  const employee = new SimpleDID();

  await cityLab.generateDID();
  await employee.generateDID();

  const healthCred = new HealthCredential(cityLab.did, employee.did);

  const testResult = await healthCred.issueHealthRecord(
    {
      testType: "COVID-19 RT-PCR",
      testResult: "Negative",
      testDate: "2024-01-15",
      validUntil: "2024-01-22",
      labName: "City Health Lab",
      buildingAccess: true,
      patientId: "P123456",
    },
    cityLab.keyPair.privateKey
  );

  // Different verification contexts
  const verificationContexts = [
    {
      name: "Building Entry",
      presentation: HealthCredential.createBuildingAccessProof(
        testResult,
        employee.did
      ),
    },
    {
      name: "Employer Check",
      presentation: HealthCredential.createEmployerHealthCheck(
        testResult,
        employee.did
      ),
    },
    {
      name: "Medical Record",
      presentation: HealthCredential.createMedicalRecord(
        testResult,
        employee.did
      ),
    },
  ];

  verificationContexts.forEach((context) => {
    console.log(
      `${context.name} reveals:`,
      SelectiveDisclosure.getFieldsFromPresentation(context.presentation)
    );
  });

  // Output:
  // Building Entry reveals: ["buildingAccess", "validUntil"]
  // Employer Check reveals: ["testType", "testResult", "testDate", "buildingAccess"]
  // Medical Record reveals: ["testType", "testResult", "testDate", "validUntil", "labName", "patientId"]
}
```

### 4. Supply Chain Verification (GS1 Integration)

**Use Case**: Product authenticity without revealing trade secrets

```javascript
class ProductCredential extends VerifiableCredential {
  async issueProductCertificate(productData, manufacturer_privateKey) {
    const credentialData = {
      type: ["VerifiableCredential", "ProductCredential"],
      productName: productData.productName,
      manufacturingDate: productData.manufacturingDate,
      factoryLocation: productData.factoryLocation,
      isAuthentic: productData.isAuthentic,
      sustainabilityScore: productData.sustainabilityScore,
      carbonFootprint: productData.carbonFootprint,
      batchNumber: productData.batchNumber,
      qualityGrade: productData.qualityGrade,
    };

    return await this.issueCredential(credentialData, manufacturer_privateKey);
  }

  static createConsumerVerification(productCredential, holderDID) {
    // For consumers - show authenticity and sustainability
    return SelectiveDisclosure.createPresentation(
      productCredential,
      ["productName", "isAuthentic", "sustainabilityScore"],
      holderDID
    );
  }

  static createCustomsDeclaration(productCredential, holderDID) {
    // For customs - show manufacturing details and origin
    return SelectiveDisclosure.createPresentation(
      productCredential,
      ["productName", "manufacturingDate", "factoryLocation", "isAuthentic"],
      holderDID
    );
  }

  static createRetailerVerification(productCredential, holderDID) {
    // For retailers - show quality and authenticity
    return SelectiveDisclosure.createPresentation(
      productCredential,
      ["productName", "isAuthentic", "qualityGrade", "sustainabilityScore"],
      holderDID
    );
  }

  static createSupplyChainAudit(productCredential, holderDID) {
    // For auditors - show environmental impact details
    return SelectiveDisclosure.createPresentation(
      productCredential,
      [
        "productName",
        "factoryLocation",
        "carbonFootprint",
        "sustainabilityScore",
        "batchNumber",
      ],
      holderDID
    );
  }
}

// Usage
async function demonstrateProductCredential() {
  const nike = new SimpleDID();
  const product = new SimpleDID();

  await nike.generateDID();
  await product.generateDID();

  const productCred = new ProductCredential(nike.did, product.did);

  const certificate = await productCred.issueProductCertificate(
    {
      productName: "Air Max 2024",
      manufacturingDate: "2024-01-10",
      factoryLocation: "Vietnam",
      isAuthentic: true,
      sustainabilityScore: "A+",
      carbonFootprint: "2.5kg CO2",
      batchNumber: "B240110-001",
      qualityGrade: "Premium",
    },
    nike.keyPair.privateKey
  );

  // Different stakeholder needs
  const stakeholders = [
    {
      name: "Consumer Purchase",
      presentation: ProductCredential.createConsumerVerification(
        certificate,
        product.did
      ),
    },
    {
      name: "Customs Inspection",
      presentation: ProductCredential.createCustomsDeclaration(
        certificate,
        product.did
      ),
    },
    {
      name: "Retailer Verification",
      presentation: ProductCredential.createRetailerVerification(
        certificate,
        product.did
      ),
    },
    {
      name: "Supply Chain Audit",
      presentation: ProductCredential.createSupplyChainAudit(
        certificate,
        product.did
      ),
    },
  ];

  stakeholders.forEach((stakeholder) => {
    console.log(
      `${stakeholder.name} reveals:`,
      SelectiveDisclosure.getFieldsFromPresentation(stakeholder.presentation)
    );
  });

  // Output:
  // Consumer Purchase reveals: ["productName", "isAuthentic", "sustainabilityScore"]
  // Customs Inspection reveals: ["productName", "manufacturingDate", "factoryLocation", "isAuthentic"]
  // Retailer Verification reveals: ["productName", "isAuthentic", "qualityGrade", "sustainabilityScore"]
  // Supply Chain Audit reveals: ["productName", "factoryLocation", "carbonFootprint", "sustainabilityScore", "batchNumber"]
}
```

## Production Implementation Frameworks

### 1. Hyperledger Aries

**Enterprise-grade SSI framework**

```bash
# Installation
npm install @aries-framework/core
npm install @aries-framework/node
npm install @aries-framework/rest
```

```javascript
import { Agent, InitConfig, LogLevel } from "@aries-framework/core";
import { agentDependencies } from "@aries-framework/node";

// Agent configuration
const config = {
  label: "My SSI Agent",
  walletConfig: {
    id: "my-wallet",
    key: "my-wallet-key",
  },
  autoAcceptConnections: true,
  autoAcceptCredentials: true,
  logLevel: LogLevel.info,
  indyLedgers: [
    {
      id: "sovrin-staging",
      isProduction: false,
      genesisUrl:
        "https://raw.githubusercontent.com/sovrin-foundation/sovrin/stable/sovrin/pool_transactions_sandbox_genesis",
    },
  ],
};

// Initialize agent
const agent = new Agent({ config, dependencies: agentDependencies });
await agent.initialize();

// Create connection invitation
const { outOfBandRecord, invitationUrl } = await agent.oob.createInvitation();
console.log("Invitation URL:", invitationUrl);

// Issue credential
const credentialExchangeRecord = await agent.credentials.offerCredential({
  connectionId: "connection-id",
  credentialFormats: {
    indy: {
      credentialDefinitionId: "cred-def-id",
      attributes: [
        { name: "name", value: "Alice Smith" },
        { name: "degree", value: "Bachelor of Science" },
      ],
    },
  },
});
```

### 2. Microsoft ION (Identity Overlay Network)

**Bitcoin-anchored DID method**

```bash
# Installation
npm install @decentralized-identity/ion-tools
npm install @decentralized-identity/ion-sdk
```

```javascript
import ION from "@decentralized-identity/ion-tools";

// Generate keys
const authnKeys = await ION.generateKeyPair();
const updateKeys = await ION.generateKeyPair();
const recoveryKeys = await ION.generateKeyPair();

// Create DID
const didCreateRequest = await ION.createLongFormDid({
  recoveryKey: recoveryKeys.publicKey,
  updateKey: updateKeys.publicKey,
  document: {
    publicKeys: [
      {
        id: "key-1",
        type: "EcdsaSecp256k1VerificationKey2019",
        publicKeyJwk: authnKeys.publicKey,
        purposes: ["authentication", "assertionMethod"],
      },
    ],
    services: [
      {
        id: "domain-1",
        type: "LinkedDomains",
        serviceEndpoint: "https://example.com",
      },
    ],
  },
});

console.log("Long-form DID:", didCreateRequest.longFormDid);
console.log("Short-form DID:", didCreateRequest.shortFormDid);

// Resolve DID
const didDocument = await ION.resolve(didCreateRequest.longFormDid);
console.log("DID Document:", didDocument);

// Anchor DID to Bitcoin (requires ION node)
const anchoredDid = await ION.anchor(didCreateRequest);
```

### 3. Trinsic Platform

**Developer-friendly SSI-as-a-service**

```bash
# Installation
npm install @trinsic/trinsic
```

```javascript
import { TrinsicService } from "@trinsic/trinsic";

// Initialize service
const trinsic = new TrinsicService({
  authToken: "your-api-token",
});

// Create wallet
const wallet = await trinsic.wallet.createWallet({
  externalId: "alice-wallet",
});

// Create credential template
const template = await trinsic.templates.create({
  name: "University Degree",
  fields: {
    name: { type: "string" },
    degree: { type: "string" },
    university: { type: "string" },
    graduationDate: { type: "date" },
  },
});

// Issue credential
const credential = await trinsic.credential.issueCredential({
  templateId: template.id,
  valuesJson: JSON.stringify({
    name: "Alice Smith",
    degree: "Bachelor of Science",
    university: "Example University",
    graduationDate: "2024-05-15",
  }),
});

// Verify credential
const verification = await trinsic.credential.verifyCredential({
  credentialJson: credential.credentialJson,
});

console.log("Verification result:", verification.isValid);
```

### 4. Complete SSI Wallet Implementation

```javascript
class SSIWallet {
  constructor() {
    this.dids = new Map();
    this.credentials = new Map();
    this.connections = new Map();
    this.keyManager = new SSIKeyManager();
  }

  async createDID(method = "simple") {
    const did = new SimpleDID();
    const didId = await did.generateDID();

    this.dids.set(didId, {
      did: did,
      method: method,
      created: Date.now(),
      keyPair: did.keyPair,
    });

    return didId;
  }

  async storeCredential(credential, metadata = {}) {
    const credentialId = credential.id || crypto.randomUUID();

    this.credentials.set(credentialId, {
      credential: credential,
      metadata: {
        ...metadata,
        stored: Date.now(),
        verified: await this.verifyCredential(credential),
      },
    });

    return credentialId;
  }

  async createPresentation(credentialIds, fieldsToReveal, holderDID) {
    const credentials = credentialIds
      .map((id) => this.credentials.get(id)?.credential)
      .filter(Boolean);

    if (credentials.length === 0) {
      throw new Error("No valid credentials found");
    }

    // For simplicity, we'll use the first credential
    const credential = credentials[0];

    return SelectiveDisclosure.createPresentation(
      credential,
      fieldsToReveal,
      holderDID
    );
  }

  async verifyCredential(credential) {
    try {
      // In a real implementation, you'd resolve the issuer's DID
      // and get their public key from the DID document
      const issuerDID = credential.issuer;
      const issuerInfo = this.dids.get(issuerDID);

      if (!issuerInfo) {
        return { isValid: false, reason: "Unknown issuer" };
      }

      const vc = new VerifiableCredential(
        issuerDID,
        credential.credentialSubject.id
      );
      const verification = await vc.verifyCredential(
        credential,
        issuerInfo.keyPair.publicKey
      );

      return verification;
    } catch (error) {
      return { isValid: false, reason: error.message };
    }
  }

  listCredentials() {
    return Array.from(this.credentials.entries()).map(([id, data]) => ({
      id,
      type: data.credential.type,
      issuer: data.credential.issuer,
      subject: data.credential.credentialSubject.id,
      issuanceDate: data.credential.issuanceDate,
      verified: data.metadata.verified.isValid,
    }));
  }

  listDIDs() {
    return Array.from(this.dids.entries()).map(([id, data]) => ({
      did: id,
      method: data.method,
      created: new Date(data.created).toISOString(),
    }));
  }

  async backup(password) {
    const backupData = {
      dids: Array.from(this.dids.entries()),
      credentials: Array.from(this.credentials.entries()),
      timestamp: Date.now(),
    };

    // In production, encrypt with password
    return JSON.stringify(backupData);
  }

  async restore(backupData, password) {
    try {
      const data = JSON.parse(backupData);

      this.dids = new Map(data.dids);
      this.credentials = new Map(data.credentials);

      return true;
    } catch (error) {
      throw new Error("Failed to restore wallet: " + error.message);
    }
  }
}

// Usage Example
async function demonstrateSSIWallet() {
  const wallet = new SSIWallet();

  // Create DIDs
  const universityDID = await wallet.createDID("simple");
  const aliceDID = await wallet.createDID("simple");

  console.log("Created DIDs:", wallet.listDIDs());

  // Issue and store credential
  const university = wallet.dids.get(universityDID);
  const alice = wallet.dids.get(aliceDID);

  const diploma = new VerifiableCredential(universityDID, aliceDID);
  const credential = await diploma.issueCredential(
    {
      degree: "PhD in Computer Science",
      university: "Example University",
      graduationDate: "2024-05-15",
    },
    university.did.keyPair.privateKey
  );

  const credentialId = await wallet.storeCredential(credential, {
    category: "education",
    tags: ["degree", "university"],
  });

  console.log("Stored credentials:", wallet.listCredentials());

  // Create presentation
  const presentation = await wallet.createPresentation(
    [credentialId],
    ["degree", "university"],
    aliceDID
  );

  console.log("Created presentation:", presentation);

  // Backup wallet
  const backup = await wallet.backup("password123");
  console.log("Wallet backed up successfully");

  return { wallet, backup };
}
```

## Best Practices

### Security Considerations

#### 1. Key Management Lifecycle

```javascript
class SSIKeyManager {
  constructor() {
    this.keyRotationInterval = 365 * 24 * 60 * 60 * 1000; // 1 year
    this.keys = new Map();
    this.revokedKeys = new Set();
  }

  async generateKey(did, purpose = "authentication") {
    const keyPair = await crypto.subtle.generateKey(
      {
        name: "ECDSA",
        namedCurve: "P-256",
      },
      true,
      ["sign", "verify"]
    );

    const keyId = `${did}#${purpose}-${Date.now()}`;

    this.keys.set(keyId, {
      keyPair,
      purpose,
      created: Date.now(),
      rotationDue: Date.now() + this.keyRotationInterval,
      status: "active",
    });

    return { keyId, keyPair };
  }

  shouldRotateKey(keyId) {
    const keyInfo = this.keys.get(keyId);
    return keyInfo && Date.now() > keyInfo.rotationDue;
  }

  async rotateKey(oldKeyId, did) {
    const oldKeyInfo = this.keys.get(oldKeyId);
    if (!oldKeyInfo) {
      throw new Error("Key not found");
    }

    // Generate new key
    const { keyId: newKeyId, keyPair: newKeyPair } = await this.generateKey(
      did,
      oldKeyInfo.purpose
    );

    // Mark old key as rotated (keep for verification of old credentials)
    this.keys.set(oldKeyId, {
      ...oldKeyInfo,
      status: "rotated",
      rotatedAt: Date.now(),
      replacedBy: newKeyId,
    });

    return { newKeyId, newKeyPair };
  }

  revokeKey(keyId, reason) {
    const keyInfo = this.keys.get(keyId);
    if (!keyInfo) {
      throw new Error("Key not found");
    }

    this.keys.set(keyId, {
      ...keyInfo,
      status: "revoked",
      revokedAt: Date.now(),
      revocationReason: reason,
    });

    this.revokedKeys.add(keyId);
  }

  isKeyValid(keyId) {
    const keyInfo = this.keys.get(keyId);
    return (
      keyInfo && keyInfo.status === "active" && !this.revokedKeys.has(keyId)
    );
  }

  getKeyHistory(did) {
    return Array.from(this.keys.entries())
      .filter(([keyId, keyInfo]) => keyId.startsWith(did))
      .map(([keyId, keyInfo]) => ({
        keyId,
        purpose: keyInfo.purpose,
        status: keyInfo.status,
        created: new Date(keyInfo.created).toISOString(),
        rotationDue: new Date(keyInfo.rotationDue).toISOString(),
      }));
  }
}

// Usage
const keyManager = new SSIKeyManager();
const did = "did:example:alice123";

// Generate initial key
const { keyId, keyPair } = await keyManager.generateKey(did, "authentication");

// Check if rotation is needed
if (keyManager.shouldRotateKey(keyId)) {
  const { newKeyId } = await keyManager.rotateKey(keyId, did);
  console.log("Key rotated from", keyId, "to", newKeyId);
}

// Get key history
console.log("Key history:", keyManager.getKeyHistory(did));
```

#### 2. Trust Registry Pattern

```javascript
class TrustRegistry {
  constructor() {
    this.trustedIssuers = new Map();
    this.revokedCredentials = new Set();
    this.trustLevels = {
      GOVERNMENT: 100,
      ACCREDITED_INSTITUTION: 90,
      VERIFIED_ORGANIZATION: 75,
      COMMUNITY_VERIFIED: 50,
      UNVERIFIED: 0,
    };
  }

  addTrustedIssuer(issuerDID, metadata) {
    this.trustedIssuers.set(issuerDID, {
      ...metadata,
      addedAt: Date.now(),
      trustLevel: metadata.trustLevel || this.trustLevels.UNVERIFIED,
      verifiedBy: metadata.verifiedBy,
      credentials: new Set(),
    });
  }

  getTrustLevel(issuerDID) {
    const issuer = this.trustedIssuers.get(issuerDID);
    return issuer ? issuer.trustLevel : this.trustLevels.UNVERIFIED;
  }

  isTrustedIssuer(
    issuerDID,
    minimumTrustLevel = this.trustLevels.VERIFIED_ORGANIZATION
  ) {
    const trustLevel = this.getTrustLevel(issuerDID);
    return trustLevel >= minimumTrustLevel;
  }

  revokeCredential(credentialId, issuerDID, reason) {
    this.revokedCredentials.add({
      id: credentialId,
      issuer: issuerDID,
      revokedAt: Date.now(),
      reason: reason,
    });

    // Track revocation in issuer record
    const issuer = this.trustedIssuers.get(issuerDID);
    if (issuer) {
      issuer.revokedCredentials = issuer.revokedCredentials || new Set();
      issuer.revokedCredentials.add(credentialId);
    }
  }

  isCredentialRevoked(credentialId) {
    return Array.from(this.revokedCredentials).some(
      (revoked) => revoked.id === credentialId
    );
  }

  async verifyIssuerReputation(issuerDID) {
    const issuer = this.trustedIssuers.get(issuerDID);
    if (!issuer) {
      return { isValid: false, reason: "Unknown issuer" };
    }

    const totalCredentials = issuer.credentials.size;
    const revokedCount = issuer.revokedCredentials?.size || 0;
    const revocationRate =
      totalCredentials > 0 ? revokedCount / totalCredentials : 0;

    return {
      isValid: issuer.trustLevel >= this.trustLevels.VERIFIED_ORGANIZATION,
      trustLevel: issuer.trustLevel,
      revocationRate: revocationRate,
      reputation: this.calculateReputation(issuer.trustLevel, revocationRate),
      verifiedBy: issuer.verifiedBy,
    };
  }

  calculateReputation(trustLevel, revocationRate) {
    const baseScore = trustLevel / 100;
    const penaltyFactor = Math.max(0, 1 - revocationRate * 10); // Penalize high revocation rates
    return Math.round(baseScore * penaltyFactor * 100);
  }

  getTrustedIssuers(credentialType) {
    return Array.from(this.trustedIssuers.entries())
      .filter(
        ([did, issuer]) =>
          !credentialType ||
          issuer.supportedCredentials?.includes(credentialType)
      )
      .map(([did, issuer]) => ({
        did,
        name: issuer.name,
        trustLevel: issuer.trustLevel,
        reputation: this.calculateReputation(
          issuer.trustLevel,
          (issuer.revokedCredentials?.size || 0) /
            Math.max(1, issuer.credentials.size)
        ),
      }))
      .sort((a, b) => b.reputation - a.reputation);
  }
}

// Usage
const trustRegistry = new TrustRegistry();

// Add trusted issuers
trustRegistry.addTrustedIssuer("did:gov:us:dhs", {
  name: "US Department of Homeland Security",
  type: "government",
  trustLevel: trustRegistry.trustLevels.GOVERNMENT,
  supportedCredentials: ["immigration", "citizenship"],
  verifiedBy: "US Government",
});

trustRegistry.addTrustedIssuer("did:edu:harvard", {
  name: "Harvard University",
  type: "educational_institution",
  trustLevel: trustRegistry.trustLevels.ACCREDITED_INSTITUTION,
  supportedCredentials: ["education", "research"],
  verifiedBy: "US Department of Education",
});

// Check trust
console.log(
  "Harvard trust level:",
  trustRegistry.getTrustLevel("did:edu:harvard")
);
console.log(
  "Is Harvard trusted?:",
  trustRegistry.isTrustedIssuer("did:edu:harvard")
);

// Get trusted issuers for education credentials
console.log(
  "Trusted education issuers:",
  trustRegistry.getTrustedIssuers("education")
);
```

### Privacy Best Practices

#### 1. Zero-Knowledge Proofs Integration

```javascript
// Simplified ZK proof for age verification
class AgeProofZK {
  static async proveAgeOver(birthDate, minimumAge, holderDID) {
    const currentDate = new Date();
    const birthDateTime = new Date(birthDate);
    const ageInYears = currentDate.getFullYear() - birthDateTime.getFullYear();

    // Adjust for birthday not yet occurred this year
    const hasBirthdayOccurred =
      currentDate.getMonth() > birthDateTime.getMonth() ||
      (currentDate.getMonth() === birthDateTime.getMonth() &&
        currentDate.getDate() >= birthDateTime.getDate());

    const actualAge = hasBirthdayOccurred ? ageInYears : ageInYears - 1;
    const isOverAge = actualAge >= minimumAge;

    // Generate ZK proof (simplified - in production use snarkjs or similar)
    const proof = await this.generateZKProof({
      publicInputs: [minimumAge, isOverAge ? 1 : 0],
      privateInputs: [birthDate],
      circuit: "age_verification_circuit",
    });

    return {
      isOverAge,
      minimumAge,
      proof,
      holder: holderDID,
      timestamp: Date.now(),
    };
  }

  static async verifyAgeProof(proofData) {
    // Verify ZK proof without revealing actual age
    const isValidProof = await this.verifyZKProof(proofData.proof);

    return {
      isValid: isValidProof && proofData.isOverAge,
      minimumAge: proofData.minimumAge,
      holder: proofData.holder,
      verifiedAt: Date.now(),
    };
  }

  static async generateZKProof(inputs) {
    // Placeholder for actual ZK proof generation
    // In production, would use libraries like snarkjs, circom, etc.
    const mockProof = {
      a:
        "0x" +
        crypto
          .getRandomValues(new Uint8Array(32))
          .reduce((a, b) => a + b.toString(16).padStart(2, "0"), ""),
      b:
        "0x" +
        crypto
          .getRandomValues(new Uint8Array(32))
          .reduce((a, b) => a + b.toString(16).padStart(2, "0"), ""),
      c:
        "0x" +
        crypto
          .getRandomValues(new Uint8Array(32))
          .reduce((a, b) => a + b.toString(16).padStart(2, "0"), ""),
      publicSignals: inputs.publicInputs,
    };

    return mockProof;
  }

  static async verifyZKProof(proof) {
    // Placeholder for actual ZK proof verification
    // In production, would verify against the circuit's verifying key
    return proof && proof.a && proof.b && proof.c;
  }
}

// Usage
async function demonstrateAgeProof() {
  const alice = new SimpleDID();
  await alice.generateDID();

  // Alice proves she's over 21 without revealing her exact age
  const ageProof = await AgeProofZK.proveAgeOver(
    "1995-03-15", // Alice's birth date
    21, // Minimum age requirement
    alice.did
  );

  console.log("Age proof generated:", {
    isOverAge: ageProof.isOverAge,
    minimumAge: ageProof.minimumAge,
    holder: ageProof.holder,
    // Note: actual birth date is not revealed
  });

  // Verifier checks the proof
  const verification = await AgeProofZK.verifyAgeProof(ageProof);
  console.log("Age proof verification:", verification);
}
```

#### 2. Credential Linking Prevention

```javascript
class PrivacyPreservingPresentation {
  static async createUnlinkablePresentation(credentials, requestedFields, holderDID) {
    // Use different pseudonyms for each presentation
    const presentationId = crypto.randomUUID();
    const timestamp = Date.now();

    // Add noise to timestamps to prevent timing correlation
    const noisyTimestamp = timestamp + (Math.random() * 60000) - 30000; // ±30 seconds

    const presentation = {
      "@context": [
        "https://www.w3.org/2018/credentials/v1",
        "https://www.w3.org/2018/presentations/v1"
      ],
      "type": ["VerifiablePresentation"],
      "id": `urn:uuid:${presentationId}`,
      "created": new Date(noisyTimestamp).toISOString(),
      "holder": holderDID,
      "verifiableCredential": credentials.map(cred =>
        this.minimizeCredential(cred, requestedFields)
      )
    };

    return presentation;
  }

  static minimizeCredential(credential, requestedFields) {
    // Remove unnecessary metadata to prevent correlation
    const { id, issuanceDate, ...essentialCredential } = credential;

    return {
      ...essentialCredential,
      credentialSubject: {
        id: credential.credentialSubject.id,
        ...SelectiveDisclosure.selectFields(
          credential.credentialSubject,
          requestedFields
        )
      }
    };
  }

  static async createPairwisePresentation(credentials, requestedFields, holderDID, verifierDID) {
    // Create unique presentation for this specific verifier relationship
    const pairwiseId = await this.generatePairwiseId(holderDID, verifierDID);

    const presentation = await this.createUnlinkablePresentation(
      credentials,
      requestedFields,
      pairwiseId
    );

    return {
      ...presentation,
      holder: pairwiseId,
      intendedAudience: verifierDID
    };
  }

  static async generatePairwiseId(holderDID, verifierDID) {
    // Generate deterministic but unlinkable ID for this relationship
    const combined = holderDID + verifierDID;
    const hash = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(combined)
    );

    const hashArray = Array.from(new Uint8Array(hash));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    return `did:pairwise:${hashHex.substring(0, 32)}`;
  }

  static detectLinkingAttempt(presentations) {
    // Analyze presentations for potential linking vectors
    const linkingVectors = [];

    for (let i = 0; i < presentations.length; i++) {
      for (let j = i + 1; j < presentations.length; j++) {
        const p1 = presentations[i];
        const p2 = presentations[j];

        // Check for same presentation ID
        if (p1.id === p2.id) {
          linkingVectors.push({
            type: 'identical_presentation_id',
            presentations: [i, j],
            risk: 'high'
          });
        }

        // Check for timestamp correlation
        const timeDiff = Math.abs(
          new Date(p1.created).getTime() - new Date(p2.created).getTime()
        );
        if (timeDiff < 60000) { // Within 1 minute
          linkingVectors.push({
            type: 'timestamp_correlation',
            presentations: [i, j],
            risk: 'medium',
            timeDifference: timeDiff
          });
        }

        // Check for identical credential patterns
        const p1Fields = this.extractFieldPatterns(p1);
        const p2Fields = this.extractFieldPatterns(p2);
        const commonFields = p1Fields.filter(f => p2Fields.includes(f));

        if
```
