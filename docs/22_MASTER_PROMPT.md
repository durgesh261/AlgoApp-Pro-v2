# Master Implementation Prompt

## Table of Contents

- [Purpose](#purpose)
- [Scope](#scope)
- [Implementation brief](#implementation-brief)
- [Delivery constraints](#delivery-constraints)
- [Required response format](#required-response-format)
- [Prohibited outcomes](#prohibited-outcomes)
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

## Required response format

For each implementation task, state: affected requirements and document links; proposed design and assumptions; files/contracts/data migrations affected; security and risk impact; test plan including failure cases; observability and rollout plan; and validation results. For a high-risk change, add rollback criteria, owner approvals needed, and whether live execution is affected. If the task cannot satisfy the [Implementation Blueprint](23_IMPLEMENTATION_BLUEPRINT.md), stop and request an ADR rather than inventing a deviation.

## Prohibited outcomes

Do not add direct browser-to-exchange communication, arbitrary strategy code execution, unencrypted credentials, cross-tenant queries, unversioned contract changes, silent retries after an unknown venue submission, or calculations using binary floating point for financial values. Do not claim an order filled until reconciled venue evidence exists.

## Future work

Create role-specific prompts for architecture review, threat modeling, incident response, and release management.

## Related documents

- [Master Index](00_MASTER_INDEX.md)
- [Coding Rules](20_CODING_RULES.md)
- [Roadmap](21_ROADMAP.md)
- [Implementation Blueprint](23_IMPLEMENTATION_BLUEPRINT.md)
