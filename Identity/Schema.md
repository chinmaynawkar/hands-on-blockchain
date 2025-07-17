# Credential Schemas in Self-Sovereign Identity (SSI)

## Overview: What Are Credential Schemas?

A **credential schema** defines the structure, required fields, and data types for a verifiable credential (VC). It acts as a contract between issuers, holders, and verifiers, ensuring that all parties interpret the credential data consistently and securely.

- **Analogy:** Like a form template for a driver's license or diploma, a schema specifies what information must be present (e.g., name, date of birth, degree) and how it should be formatted.
- **Purpose:** Promotes interoperability, validation, and trust in digital credentials across organizations and ecosystems.

## Why Schemas Matter

- **Validation:** Verifiers can automatically check if a credential is well-formed and complete.
- **Interoperability:** Multiple issuers and verifiers can agree on a common data structure.
- **Automation:** Enables automated processing, filtering, and selective disclosure.
- **Governance:** Supports versioning, updates, and multi-organization collaboration.

---

## 1. Credential Schema Basics

### Example: W3C Verifiable Credential with Schema

```json
{
  "@context": [
    "https://www.w3.org/ns/credentials/v2",
    "https://www.w3.org/ns/credentials/examples/v2"
  ],
  "id": "https://example.com/credentials/3732",
  "type": ["VerifiableCredential", "EmailCredential"],
  "issuer": "https://example.com/issuers/14",
  "issuanceDate": "2010-01-01T19:23:24Z",
  "credentialSubject": {
    "id": "did:example:ebfeb1f712ebc6f1c276e12ec21",
    "emailAddress": "subject@example.com"
  },
  "credentialSchema": {
    "id": "https://example.com/schemas/email.json",
    "type": "JsonSchema"
  }
}
```

### Example: JSON Schema for the Credential

```json
{
  "$id": "https://example.com/schemas/email.json",
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "EmailCredential",
  "description": "EmailCredential using JsonSchema",
  "type": "object",
  "properties": {
    "credentialSubject": {
      "type": "object",
      "properties": {
        "emailAddress": {
          "type": "string",
          "format": "email"
        }
      },
      "required": ["emailAddress"]
    }
  }
}
```

---

## 2. Schema Builder Components

Modern schema builders (e.g., Affinidi, Hyperledger Aries, Trinsic) provide user-friendly interfaces to define, publish, and manage credential schemas.

### Key Components

- **Schema Name & Version:** Human-readable identifier and version number.
- **Fields/Attributes:** Each field has a name, type (string, number, date, boolean, object), and optional constraints (e.g., required, format).
- **Nested Objects:** Support for complex, nested data structures.
- **Metadata:** Description, discoverability, URIs for JSON-LD context and schema.
- **Access Control:** Public/private visibility, governance settings.

### Example: Affinidi Schema Builder Output

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://schema.affinidi.io/ExampleSchemaV1-0.json",
  "$metadata": {
    "version": 1,
    "revision": 0,
    "discoverable": true,
    "uris": {
      "jsonLdContext": "https://schema.affinidi.io/ExampleSchemaV1-0.jsonld",
      "jsonSchema": "https://schema.affinidi.io/ExampleSchemaV1-0.json"
    }
  },
  "title": "ExampleSchema",
  "type": "object",
  "required": [
    "@context",
    "type",
    "issuer",
    "issuanceDate",
    "credentialSubject"
  ],
  "properties": {
    "@context": { "type": ["string", "array", "object"] },
    "id": { "type": "string", "format": "uri" },
    "type": { "type": ["string", "array"], "items": { "type": "string" } },
    "issuer": { "type": ["string", "object"], "format": "uri" },
    "issuanceDate": { "type": "string", "format": "date-time" },
    "credentialSubject": {
      "type": "object",
      "properties": {
        "first_name": { "type": "string" },
        "last_name": { "type": "string" },
        "dob": { "type": "string", "format": "date" }
      }
    }
  }
}
```

---

## 3. Schema Versioning and Evolution

### Why Versioning?

- **Backward Compatibility:** Old credentials remain valid as schemas evolve.
- **Change Management:** Track updates, deprecations, and new fields.
- **Auditability:** Verifiers can check which schema version a credential conforms to.

### Best Practices

- Use semantic versioning (e.g., `v1.0`, `v1.1`).
- Publish schemas at stable, dereferenceable URLs (e.g., `https://example.com/schemas/degree-v1.json`).
- Never change a published schema in-place; create a new version for breaking changes.

### Example: Schema Versioning in Practice

```json
{
  "$id": "https://example.com/schemas/degree-v1.json",
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "DegreeCredential v1.0",
  "properties": {
    "credentialSubject": {
      "type": "object",
      "properties": {
        "degree": { "type": "string" },
        "field": { "type": "string" }
      },
      "required": ["degree", "field"]
    }
  }
}
```

#### Evolving the Schema

- Add a new field (e.g., `gpa`): create `degree-v2.json`.
- Verifiers check the `credentialSchema.id` to know which version to validate against.

---

## 4. Multi-Organization Schema Governance

### Why Governance?

- **Consistency:** Ensures all issuers use the same schema for a credential type (e.g., diplomas).
- **Trust:** Stakeholders agree on field definitions, required attributes, and validation rules.
- **Change Control:** Updates require consensus, reducing risk of breaking changes.

### Governance Models

- **Central Registry:** A single organization (e.g., a ministry of education) publishes and maintains schemas.
- **Consortium/Working Group:** Multiple organizations collaborate (e.g., universities, hospitals, supply chain partners).
- **Open Community:** Anyone can propose, review, and adopt schemas (e.g., Schema.org, W3C).

### Example: Hyperledger Aries Schema Governance

- **Schema Registry:** On-ledger or off-ledger registry of schemas.
- **Endorsement:** Schemas can be endorsed by trusted parties.
- **Versioning:** Each schema has a unique ID and version.
- **Governance Policies:** Define who can create, update, or deprecate schemas.

---

## 5. Real-World Schema Examples

### A. Education: University Degree Credential

**Schema:**

```json
{
  "$id": "https://example.edu/schemas/degree-v1.json",
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "DegreeCredential",
  "type": "object",
  "properties": {
    "credentialSubject": {
      "type": "object",
      "properties": {
        "name": { "type": "string" },
        "degree": { "type": "string" },
        "field": { "type": "string" },
        "graduationDate": { "type": "string", "format": "date" }
      },
      "required": ["name", "degree", "field", "graduationDate"]
    }
  }
}
```

**Credential Example:**

```json
{
  "@context": ["https://www.w3.org/ns/credentials/v2"],
  "type": ["VerifiableCredential", "DegreeCredential"],
  "issuer": "did:university:harvard",
  "issuanceDate": "2024-05-15T00:00:00Z",
  "credentialSubject": {
    "name": "Alice Smith",
    "degree": "Bachelor of Science",
    "field": "Computer Science",
    "graduationDate": "2024-05-15"
  },
  "credentialSchema": {
    "id": "https://example.edu/schemas/degree-v1.json",
    "type": "JsonSchema"
  }
}
```

### B. Healthcare: COVID-19 Test Result

**Schema:**

```json
{
  "$id": "https://example.com/schemas/covid-test-v1.json",
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "CovidTestCredential",
  "type": "object",
  "properties": {
    "credentialSubject": {
      "type": "object",
      "properties": {
        "patientName": { "type": "string" },
        "testType": { "type": "string" },
        "testResult": { "type": "string", "enum": ["Negative", "Positive"] },
        "testDate": { "type": "string", "format": "date" }
      },
      "required": ["patientName", "testType", "testResult", "testDate"]
    }
  }
}
```

**Credential Example:**

```json
{
  "@context": ["https://www.w3.org/ns/credentials/v2"],
  "type": ["VerifiableCredential", "CovidTestCredential"],
  "issuer": "did:lab:cityhealth",
  "issuanceDate": "2024-01-15T00:00:00Z",
  "credentialSubject": {
    "patientName": "Bob Lee",
    "testType": "COVID-19 RT-PCR",
    "testResult": "Negative",
    "testDate": "2024-01-15"
  },
  "credentialSchema": {
    "id": "https://example.com/schemas/covid-test-v1.json",
    "type": "JsonSchema"
  }
}
```

### C. Supply Chain: Product Authenticity Certificate

**Schema:**

```json
{
  "$id": "https://example.com/schemas/product-auth-v1.json",
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "ProductAuthCredential",
  "type": "object",
  "properties": {
    "credentialSubject": {
      "type": "object",
      "properties": {
        "productId": { "type": "string" },
        "productName": { "type": "string" },
        "manufactureDate": { "type": "string", "format": "date" },
        "isAuthentic": { "type": "boolean" }
      },
      "required": ["productId", "productName", "manufactureDate", "isAuthentic"]
    }
  }
}
```

**Credential Example:**

```json
{
  "@context": ["https://www.w3.org/ns/credentials/v2"],
  "type": ["VerifiableCredential", "ProductAuthCredential"],
  "issuer": "did:manufacturer:nike",
  "issuanceDate": "2024-01-10T00:00:00Z",
  "credentialSubject": {
    "productId": "B240110-001",
    "productName": "Air Max 2024",
    "manufactureDate": "2024-01-10",
    "isAuthentic": true
  },
  "credentialSchema": {
    "id": "https://example.com/schemas/product-auth-v1.json",
    "type": "JsonSchema"
  }
}
```

---

## 6. Schema.org and Data Structures

- **Schema.org** provides a large, community-driven vocabulary for describing entities (e.g., `Person`, `Event`, `Product`).
- **Best Practice:** Reuse Schema.org types and properties in credential schemas for maximum interoperability.

### Example: Using Schema.org in a Credential Schema

```json
{
  "$id": "https://example.com/schemas/person-v1.json",
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "PersonCredential",
  "type": "object",
  "properties": {
    "credentialSubject": {
      "type": "object",
      "properties": {
        "@type": { "type": "string", "const": "Person" },
        "name": { "type": "string" },
        "birthDate": { "type": "string", "format": "date" }
      },
      "required": ["@type", "name", "birthDate"]
    }
  }
}
```

---

## 7. Schema Governance in Practice: Multi-Org Example

### Example: Education Consortium

- **Participants:** 10 universities agree on a common `DegreeCredential` schema.
- **Process:**
  - Working group drafts schema.
  - Each university reviews and signs off.
  - Schema is published at a stable URL and versioned.
  - All credentials reference the shared schema.
- **Governance:**
  - Changes require majority approval.
  - New versions are published for breaking changes.

---

## 8. Further Resources

- [W3C Verifiable Credentials JSON Schema Spec](https://www.w3.org/TR/vc-json-schema/)
- [W3C Verifiable Credentials Data Model v2.0](https://www.w3.org/TR/vc-data-model-2.0/)
- [Hyperledger Aries RFCs](https://github.com/hyperledger/aries-rfcs)
- [Schema.org](https://schema.org/)
- [Affinidi Schema Builder Docs](https://docs.affinidi.com/docs/affinidi-elements/schema-builder)

---

## Summary Table: Key Concepts

| Concept                | What It Is                                              | Example/Tool                 |
| ---------------------- | ------------------------------------------------------- | ---------------------------- |
| Credential Schema      | Defines structure/fields for a credential               | JSON Schema, Aries, Affinidi |
| Schema Builder         | Tool to create/manage schemas                           | Affinidi, Trinsic, Aries     |
| Versioning             | Track schema changes, ensure compatibility              | v1.0, v2.0, URLs             |
| Governance             | Multi-org process for schema approval and updates       | Aries, Consortiums           |
| Real-World Example     | Education, healthcare, supply chain schemas             | See above                    |
| Schema.org Integration | Use of common vocabularies for maximum interoperability | `@type: Person`              |

---

**This file is a living document. For updates, see the W3C and Hyperledger Aries documentation.**
