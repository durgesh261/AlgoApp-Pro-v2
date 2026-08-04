# Database Design

## Table of Contents

- [Purpose](#purpose)
- [Scope](#scope)
- [Domain model](#domain-model)
- [Data integrity and retention](#data-integrity-and-retention)
- [Schema ownership and indexes](#schema-ownership-and-indexes)
- [Migration policy](#migration-policy)
- [Required table inventory](#required-table-inventory)
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

## Schema ownership and indexes

Use separate schemas or clear table prefixes for identity, trading, audit, and projections. Every tenant-owned table has `tenant_id` indexed with its primary access pattern. Mandatory unique constraints include membership `(tenant_id, user_id)`, strategy version `(strategy_id, version_number)`, inbound source event `(source, source_event_id)`, client order `(account_id, client_order_id)`, venue order `(connection_id, venue_order_id)` when present, and consumer event receipt `(consumer_name, event_id)`. Store immutable raw-payload references separately from normalized searchable fields. Audit events are write-only to application roles.

## Migration policy

Migrations are forward-only, reviewed, idempotent where feasible, and rehearsed on production-sized anonymized data. Use expand-migrate-contract: add compatible structures, deploy readers/writers, backfill with monitoring, then remove obsolete fields only in a later release. A migration that affects order, position, balance, or policy data requires a backup verification, reconciliation plan, and explicit rollback decision.

## Required table inventory

| Area | Required tables or equivalent aggregates |
| --- | --- |
| Identity | `organizations`, `users`, `memberships`, `roles`, `sessions`, `mfa_factors`, `api_token_metadata`, `auth_recovery_events` |
| Configuration | `organization_settings`, `exchange_connections`, `connection_secret_references`, `accounts`, `instruments`, `instrument_versions`, `market_quotes` |
| Strategy and risk | `strategies`, `strategy_versions`, `strategy_approvals`, `signals`, `decisions`, `risk_policies`, `risk_policy_versions`, `risk_assignments`, `risk_assessments`, `risk_reservations`, `kill_switches`, `kill_switch_events` |
| Execution | `order_intents`, `orders`, `fills`, `position_snapshots`, `balance_snapshots`, `funding_events`, `reconciliation_runs`, `reconciliation_exceptions` |
| Platform reliability | `idempotency_keys`, `outbox_events`, `consumer_receipts`, `webhook_nonces`, `dead_letter_references`, `scheduled_jobs` |
| Experience and reporting | `notification_preferences`, `notification_deliveries`, `export_jobs`, `dashboard_snapshots`, `metric_calculation_runs`, `audit_events`, `challenge_definitions`, `challenge_enrollments`, `challenge_scores`, `challenge_disputes` |

Tables containing immutable evidence use append-only inserts; mutable current-state tables reference the latest evidence. Foreign keys enforce ownership inside one tenant and prevent an order from referencing a risk assessment, strategy, or account belonging to another tenant. Market quote retention and raw webhook payload retention are configured separately from customer-facing data retention.

## Future work

Create an ERD, schema migrations policy, partitioning plan, and data-classification matrix.

## Related documents

- [Architecture](03_ARCHITECTURE.md)
- [API](06_API.md)
- [Analytics](14_ANALYTICS.md)
- [Security](18_SECURITY.md)
- [Implementation Blueprint](23_IMPLEMENTATION_BLUEPRINT.md)
