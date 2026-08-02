# Engineering and Coding Rules

## Table of Contents

- [Purpose](#purpose)
- [Scope](#scope)
- [Engineering rules](#engineering-rules)
- [Review standard](#review-standard)
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

## Future work

Adopt formatter/linter policy, branching strategy, conventional commit rules, ADR template, and secure code-review checklist.

## Related documents

- [Architecture](03_ARCHITECTURE.md)
- [Security](18_SECURITY.md)
- [Testing](19_TESTING.md)
