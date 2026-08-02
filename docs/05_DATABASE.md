# Database Design

## Table of Contents

- [Purpose](#purpose)
- [Scope](#scope)
- [Domain model](#domain-model)
- [Data integrity and retention](#data-integrity-and-retention)
- [Future work](#future-work)
- [Related documents](#related-documents)

## Purpose

Define data ownership, integrity, and audit expectations for the platform.

## Scope

Applies to transactional, event, analytical, and secret-reference data; raw credentials are excluded from ordinary application tables.

## Domain model

Core entities are tenant, user, role, exchange connection, strategy, strategy version, signal, decision, risk assessment, order intent, order, fill, position snapshot, balance snapshot, notification, challenge, and audit event. Each business record carries stable identifiers, tenant ownership, creation/update timestamps, and provenance. Orders and fills retain external venue identifiers and immutable lifecycle transitions.

## Data integrity and retention

Use relational constraints for ownership and state transitions; enforce unique idempotency keys for inbound signals and outbound order intents; store money and quantity as decimal precision with currency/instrument metadata; and treat audit events as append-only. Backups require encryption, restore tests, defined RPO/RTO, and retention schedules approved by legal and risk.

## Future work

Create an ERD, schema migrations policy, partitioning plan, and data-classification matrix.

## Related documents

- [Architecture](03_ARCHITECTURE.md)
- [API](06_API.md)
- [Analytics](14_ANALYTICS.md)
- [Security](18_SECURITY.md)
