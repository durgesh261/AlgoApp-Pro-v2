# Engineering and Coding Rules

## Table of Contents

- [Purpose](#purpose)
- [Scope](#scope)
- [Engineering rules](#engineering-rules)
- [Review standard](#review-standard)
- [Repository conventions](#repository-conventions)
- [Change classification](#change-classification)
- [Financial and concurrency rules](#financial-and-concurrency-rules)
- [Future work](#future-work)
- [Related documents](#related-documents)

## Purpose

Establish maintainability, correctness, and secure-development expectations for future implementation.

## Scope

Applies to application code, infrastructure code, schemas, scripts, tests, and documentation.

## Engineering rules

Keep modules cohesive, interfaces explicit, dependencies directed inward, and domain rules independent of transport and vendors. Validate external input at boundaries; use decimal-safe financial types; represent order state with explicit transitions; design all side effects for idempotency; propagate correlation IDs; never log secrets; make timezones explicit; and prefer readable code over clever code. Changes require tests and documentation when behavior, contracts, security, or operations change.

## Review standard

Reviewers verify correctness, tenancy, authorization, error paths, retries, concurrency, observability, migrations, performance, accessibility, and rollback. Execution, risk, and credential changes require designated domain-owner approval. No direct production edits or unreviewed schema changes.

## Repository conventions

Organize future code by bounded capability: identity, strategies, decisions, risk, execution, integrations, notifications, reporting, and shared contracts. Keep HTTP handlers, queue consumers, persistence adapters, and vendor clients at the edge; keep domain logic dependency-light and testable. Version APIs, events, schemas, database migrations, and strategy definitions independently. Every mutating operation emits structured audit fields and correlation IDs. Use explicit domain errors rather than transport-specific exceptions in core rules.

## Change classification

Low-risk changes affect copy or isolated read views. Medium-risk changes affect data contracts, authorization, or projections and require compatibility review. High-risk changes affect credentials, execution, risk, order state, migrations, or production topology and require designated owner approval, threat/rollback analysis, and release evidence. No change may silently alter historical accounting or recorded risk outcomes.

## Financial and concurrency rules

Represent currency, price, quantity, fee, funding, leverage, and percentage with explicit decimal scale and currency/instrument metadata. Round only at documented business boundaries using venue-approved rules. State-changing workflows use idempotency keys, optimistic concurrency revisions, durable outbox records, and explicit retry classification. Never retry an unknown venue submission without reconciliation. Lock or serialize the minimum aggregate scope needed for account/instrument exposure; do not rely on in-memory process state for correctness.

## Future work

Adopt formatter/linter policy, branching strategy, conventional commit rules, ADR template, and secure code-review checklist.

## Related documents

- [Architecture](03_ARCHITECTURE.md)
- [Security](18_SECURITY.md)
- [Testing](19_TESTING.md)
- [Implementation Blueprint](23_IMPLEMENTATION_BLUEPRINT.md)
