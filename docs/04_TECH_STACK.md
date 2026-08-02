# Technology Stack

## Table of Contents

- [Purpose](#purpose)
- [Scope](#scope)
- [Selection criteria](#selection-criteria)
- [Target capabilities](#target-capabilities)
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

## Future work

Publish approved vendor versions, dependency policy, SBOM process, and ADRs for each material selection.

## Related documents

- [Architecture](03_ARCHITECTURE.md)
- [Database](05_DATABASE.md)
- [Security](18_SECURITY.md)
