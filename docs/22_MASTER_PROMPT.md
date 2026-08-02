# Master Implementation Prompt

## Table of Contents

- [Purpose](#purpose)
- [Scope](#scope)
- [Implementation brief](#implementation-brief)
- [Delivery constraints](#delivery-constraints)
- [Future work](#future-work)
- [Related documents](#related-documents)

## Purpose

Provide a reusable, governance-aligned brief for implementation planning and assisted development.

## Scope

Use this prompt only after the relevant requirements, architecture, security, and risk documents have been reviewed. It does not override them.

## Implementation brief

Act as a senior engineer implementing one approved backlog item for AlgoApp Pro v2. First identify affected requirements, contracts, security controls, risk policy, and test cases. Preserve tenant isolation, auditability, idempotency, decimal-safe finance, explicit order state, and fail-closed execution. Keep vendor integrations behind adapters. Make the smallest coherent change, update documentation and tests, and report assumptions, validation evidence, operational impact, and rollback plan. Do not expose secrets, bypass risk controls, fabricate exchange outcomes, or introduce live execution without an approved gate.

## Delivery constraints

Prefer reviewed, incremental changes. Treat external input as untrusted. Require correlation IDs and structured errors. Do not change database schemas or public contracts without migration and compatibility plans. Escalate ambiguity in risk, regulatory, or security policy rather than guessing.

## Future work

Create role-specific prompts for architecture review, threat modeling, incident response, and release management.

## Related documents

- [Master Index](00_MASTER_INDEX.md)
- [Coding Rules](20_CODING_RULES.md)
- [Roadmap](21_ROADMAP.md)
