# Technology Stack

## Table of Contents

- [Purpose](#purpose)
- [Scope](#scope)
- [Selection criteria](#selection-criteria)
- [Target capabilities](#target-capabilities)
- [Approved baseline](#approved-baseline)
- [Dependency governance](#dependency-governance)
- [Future work](#future-work)
- [Related documents](#related-documents)

## Purpose

Set technology-selection criteria without prematurely committing the platform to unreviewed dependencies.

## Scope

This document governs evaluated categories, not a final package manifest.

## Selection criteria

Choose mature, supported technologies with secure defaults, clear licensing, deterministic testing, strong observability, documented operational behavior, and an exit strategy. Prefer managed services only where data residency, lock-in, recovery, and cost are acceptable.

## Target capabilities

The stack must support a typed web experience, a typed service runtime, relational transactions, asynchronous work, object storage for exports, managed secrets, infrastructure-as-code, centralized logs/metrics/traces, and CI security scanning. Financial calculations must use decimal-safe representations, never binary floating point for monetary values.

## Approved baseline

Use a TypeScript monorepo with a React/Next.js web application, a Node.js TypeScript API and worker runtime, PostgreSQL as the transactional store, a managed durable message broker for commands/events and dead-letter queues, Redis only for cache/rate limits/non-authoritative coordination, and S3-compatible object storage for exports. Use a managed secrets service backed by KMS, OpenTelemetry-compatible telemetry, containerized workloads, and Terraform or equivalent declarative infrastructure. The web and API may be separate deployables but must share versioned contract packages. This is a documented architecture choice, not permission to implement components in this documentation-only repository.

## Dependency governance

Pin direct dependencies, use a lockfile, maintain an SBOM, scan licenses and known vulnerabilities in CI, and define an owner for each production dependency. No unmaintained package may process credentials or order state. Secrets and exchange SDKs must be wrapped behind an adapter to permit replacement. Upgrades require changelog review, automated tests, and rollback feasibility.

## Future work

Publish approved vendor versions, dependency policy, SBOM process, and ADRs for each material selection.

## Related documents

- [Architecture](03_ARCHITECTURE.md)
- [Database](05_DATABASE.md)
- [Security](18_SECURITY.md)
- [Coding Rules](20_CODING_RULES.md)
