# Security

## Table of Contents

- [Purpose](#purpose)
- [Scope](#scope)
- [Security controls](#security-controls)
- [Incident readiness](#incident-readiness)
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

## Future work

Complete threat modeling, penetration testing, privacy assessment, key-management design, and vulnerability SLAs.

## Related documents

- [API](06_API.md)
- [Risk Engine](09_RISK_ENGINE.md)
- [Deployment](17_DEPLOYMENT.md)
