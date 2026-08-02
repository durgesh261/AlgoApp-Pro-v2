# Security

## Table of Contents

- [Purpose](#purpose)
- [Scope](#scope)
- [Security controls](#security-controls)
- [Incident readiness](#incident-readiness)
- [Data classification](#data-classification)
- [Security verification](#security-verification)
- [Identity session and service controls](#identity-session-and-service-controls)
- [Perimeter and supply-chain controls](#perimeter-and-supply-chain-controls)
- [Future work](#future-work)
- [Related documents](#related-documents)

## Purpose

Set the security baseline for protecting identities, capital-related permissions, data, and integrations.

## Scope

Covers application, infrastructure, supply chain, and operational security. It is not a certification claim.

## Security controls

Use strong authentication, MFA for privileged actions, RBAC/ABAC with least privilege, short-lived sessions, secure password handling, managed secrets, encryption in transit and at rest, tenant isolation, input validation, secure headers, rate limiting, dependency scanning, code review, audit logging, and protected administrative workflows. Exchange credentials are encrypted, masked, access-audited, rotation-ready, and never returned to clients or logs.

## Incident readiness

Maintain threat models for account takeover, credential theft, webhook spoofing, order replay, data exfiltration, dependency compromise, and denial of service. Log security-relevant events immutably; define detection, containment, communication, recovery, and post-incident review. Suspected execution compromise triggers a risk halt.

## Data classification

Classify exchange API secrets, session tokens, encryption keys, recovery codes, and authentication factors as Restricted; account identifiers, order/fill history, and personal contact data as Confidential; aggregated operational metrics as Internal; and approved public documentation as Public. Restricted data is stored only in managed secret stores, never analytics, browser storage, logs, tickets, or exports. Confidential data is encrypted at rest, access-logged, tenant-scoped, and retained only for approved business/legal periods.

## Security verification

Before production, complete architecture threat modeling, SAST/dependency/secret scanning, dynamic testing of authenticated boundaries, authorization/tenant-isolation tests, webhook replay and signature tests, penetration testing of public surfaces, backup access review, and incident tabletop exercises. High-severity findings block live trading. Security exceptions require owner, expiry, compensating control, and risk acceptance record.

## Identity session and service controls

Require MFA for Owner, Admin, and Operator roles and step-up authentication for privileged actions. Sessions are short-lived, rotated after authentication changes, device-visible, revocable, and protected from fixation. Account recovery uses verified factors, rate limits, notifications, and a recovery audit trail; it cannot silently bypass MFA. API tokens are scoped, named, expiry-bound, hashed at rest, shown only once, and individually revocable. Workloads use IAM identities rather than static cloud credentials; break-glass access is time-bound, separately logged, and reviewed.

## Perimeter and supply-chain controls

Apply TLS, HSTS, CSP, secure cookie attributes, CSRF protection, strict CORS allow-lists, input/output encoding, request-size limits, SSRF egress controls, WAF rules, per-identity/IP rate limits, and DDoS protection. Encrypt secrets using KMS-backed envelope encryption and enforce tenant isolation in authorization and database access policy. CI verifies signed/provenanced artifacts where supported, pinned dependencies, SBOM, secret scanning, vulnerability severity policy, and deployment approval. Production logs are redacted, access-controlled, tamper-evident, and retained according to classification.

## Future work

Complete threat modeling, penetration testing, privacy assessment, key-management design, and vulnerability SLAs.

## Related documents

- [API](06_API.md)
- [Risk Engine](09_RISK_ENGINE.md)
- [Deployment](17_DEPLOYMENT.md)
- [Implementation Blueprint](23_IMPLEMENTATION_BLUEPRINT.md)
