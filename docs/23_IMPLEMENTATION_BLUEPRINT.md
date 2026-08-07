# Implementation Blueprint

## Table of Contents

- [Purpose](#purpose)
- [Scope](#scope)
- [Build assumptions](#build-assumptions)
- [System boundaries](#system-boundaries)
- [Platform dependencies](#platform-dependencies)
- [Identity tenancy and roles](#identity-tenancy-and-roles)
- [Canonical states](#canonical-states)
- [Core records](#core-records)
- [Command and event contracts](#command-and-event-contracts)
- [Public API surface](#public-api-surface)
- [Critical workflows](#critical-workflows)
- [Operational defaults](#operational-defaults)
- [Acceptance gates](#acceptance-gates)
- [Future work](#future-work)
- [Related documents](#related-documents)

## Purpose

This is the implementation baseline for QuantEdge AI. It resolves the cross-cutting decisions that engineers otherwise would have to infer from product documents. A feature specification may add detail but may not contradict this document without an approved architecture decision record (ADR).

## Scope

The blueprint covers the initial multi-tenant web platform, paper trading, and a controlled Delta Exchange integration. It intentionally excludes payment processing, social trading, custody, investment advice, mobile-native clients, and multi-venue smart order routing.

## Build assumptions

The first release is a single-region, multi-tenant application with a logical tenant boundary per organization. An organization has one or more users, zero or more trading accounts, and its own strategies. All timestamps are ISO 8601 UTC. Monetary amounts, prices, quantities, fees, and rates use decimal values represented as strings at API boundaries; never use binary floating point. An instrument is identified internally by an immutable `instrument_id` and externally by its exchange symbol plus product type.

Paper and live accounts are separate account records, credentials, risk policies, and execution paths. A feature is considered live only when it can reach a venue using live credentials. Live mode is disabled by default and cannot be enabled by a strategy author alone.

## System boundaries

| Boundary | Responsibility | Prohibited responsibility |
| --- | --- | --- |
| Web application | Authenticate users, display projections, submit authenticated commands | Direct venue calls or risk-policy evaluation in the browser |
| Application API | Authorize commands, persist business state, publish durable work | Holding exchange secrets in responses |
| Strategy engine | Convert registered inputs into a proposed decision | Sending orders |
| Risk engine | Independently accept, reduce, defer, or reject an order intent | Changing strategy logic |
| Execution adapter | Submit, cancel, and reconcile venue orders | Bypassing a recorded risk approval |
| Ingestion adapter | Verify and normalize external alerts | Trusting an unverified payload |
| Analytics projector | Produce read models from immutable business events | Changing source-of-truth order state |

## Identity tenancy and roles

Tenant context derives from membership, never from a client-supplied header. A user may switch only among organizations for which an active membership exists. The initial roles are:

| Role | Permissions |
| --- | --- |
| Owner | Manage organization, members, connections, live-trading approval, and all records |
| Admin | Manage members except Owner, strategies, risk policies, and accounts; cannot transfer ownership |
| Trader | Create and manage permitted strategies, view accounts, submit permitted manual commands |
| Analyst | Read dashboards, analytics, and audit history; export permitted data |
| Viewer | Read non-sensitive dashboards and approved reports |
| Operator | Internal, separately tenant-scoped support role; read-only by default and time-bound elevation only |

Privileged actions require recent authentication and an immutable audit record: enabling live trading, changing credentials, modifying risk policies, changing membership, exporting sensitive data, and activating a kill switch.

## Canonical states

State transitions are enforced by the owning service and recorded as audit events. Terminal states cannot transition further.

| Record | States | Terminal states |
| --- | --- | --- |
| Strategy | `draft`, `validated`, `paper_enabled`, `live_approved`, `paused`, `retired`, `archived` | `archived` |
| Decision | `created`, `no_action`, `invalid`, `proposed`, `expired` | `no_action`, `invalid`, `proposed`, `expired` |
| Risk assessment | `pending`, `accepted`, `reduced`, `deferred`, `rejected`, `expired` | all except `pending` |
| Order intent | `created`, `risk_approved`, `submission_pending`, `submission_unknown`, `cancel_requested`, `closed` | `closed` |
| Order | `pending_submit`, `acknowledged`, `open`, `partially_filled`, `filled`, `cancel_pending`, `cancelled`, `rejected`, `expired`, `unknown` | `filled`, `cancelled`, `rejected`, `expired` |
| Connection | `pending_verification`, `active`, `degraded`, `revoked`, `disabled` | `revoked`, `disabled` |
| Notification | `queued`, `sent`, `delivered`, `failed`, `suppressed` | `delivered`, `failed`, `suppressed` |

An `unknown` order is a safety condition, not a terminal success. New exposure-increasing orders for that account are blocked until reconciliation returns a trustworthy state or an authorized operator resolves the exception.

## Platform dependencies

The source of truth is PostgreSQL plus its transactional outbox. A dedicated durable message broker delivers asynchronous commands and events, supports dead-letter queues, retention, and consumer replay; Redis is restricted to cache, distributed rate limiting, and non-authoritative coordination. Market data is a separately monitored integration that supplies instrument metadata, marks, and freshness signals; it may not be inferred from a client request. Cloud ingress comprises DNS, certificate management, CDN/static asset delivery, WAF/DDoS controls, load balancing, and private application networking. Runtime workloads have separate web, API, worker, and scheduled-reconciliation roles with least-privilege identities.

## Core records

Every record has `id`, `tenant_id`, `created_at`, `updated_at`, and actor or system provenance. IDs are opaque UUIDs or equivalent sortable unique identifiers. The minimum authoritative fields are:

| Record | Required fields beyond common fields |
| --- | --- |
| Strategy version | `strategy_id`, `version_number`, `status`, `definition`, `input_schema_version`, `risk_policy_id`, `effective_from` |
| Signal | `source`, `source_event_id`, `strategy_id`, `received_at`, `observed_at`, `payload_hash`, `normalized_payload`, `validation_status` |
| Decision | `signal_id`, `strategy_version_id`, `outcome`, `rationale`, `input_snapshot_hash`, `expires_at` |
| Risk assessment | `decision_id`, `policy_version`, `outcome`, `requested_notional`, `approved_notional`, `reason_codes`, `exposure_snapshot_hash` |
| Order intent | `risk_assessment_id`, `account_id`, `instrument_id`, `side`, `order_type`, `quantity`, `limit_price`, `time_in_force`, `client_order_id` |
| Order | `order_intent_id`, `venue_order_id`, `status`, `submitted_at`, `last_venue_update_at`, `filled_quantity`, `average_fill_price`, `fee_amount` |
| Audit event | `actor_type`, `actor_id`, `action`, `resource_type`, `resource_id`, `request_id`, `before`, `after`, `occurred_at` |

Supporting authoritative records include membership, authentication factor, session, API token metadata, organization settings, account, account credential reference, venue instrument, market quote, risk policy/version/assignment, risk reservation, kill-switch state/change, approval request/decision, idempotency key, outbox event, consumer receipt, webhook nonce, notification preference/delivery, export job, and reconciliation exception. The full relational inventory and constraints are in [Database Design](05_DATABASE.md).

Definitions and snapshots are immutable JSON documents validated against versioned schemas. Mutable operational records retain a revision number for optimistic concurrency control.

## Command and event contracts

All commands carry a request correlation ID and, for side effects, an idempotency key unique within tenant plus command type for 24 hours. API requests return `202 Accepted` for asynchronous work and expose a resource URL to poll; they never claim a fill before venue reconciliation.

Canonical events use `event_id`, `event_type`, `occurred_at`, `tenant_id`, `aggregate_type`, `aggregate_id`, `schema_version`, `correlation_id`, `causation_id`, and `data`. Producers persist the business change and an outbox event in one transaction. Consumers deduplicate by `event_id`, tolerate reordering, and send poison events to a quarantined review queue.

Required event families are `signal.received`, `signal.rejected`, `decision.created`, `risk.assessed`, `order_intent.created`, `order.submission_requested`, `order.venue_updated`, `position.updated`, `risk.kill_switch_changed`, `notification.requested`, and `audit.recorded`.

## Public API surface

The API base is `/api/v1`. All user endpoints require an authenticated session or bearer token; webhook endpoints have their own signature scheme. Responses wrap data as `data`, optional `meta`, and an error object with `code`, `message`, `request_id`, and field-level `details` when appropriate.

| Resource | Operations |
| --- | --- |
| Organizations and members | Read organization; list/invite/change/remove members; switch active organization |
| Identity and security | Sign in/out; enroll/verify MFA; recover account; list/revoke sessions; create/revoke scoped API tokens |
| Accounts and connections | Create/verify/disable connection; list accounts; view balances, positions, and execution health |
| Instruments and market data | List approved instruments; retrieve instrument rules, latest quote, and data-health state |
| Strategies | Create draft; create immutable version; validate; request/approve paper or live enablement; pause; retire; list decision history |
| Risk policies | Create version; validate; assign to account or strategy; activate; evaluate read-only simulation; kill switch |
| Orders | Create a manual order intent; list/get order and fills; request cancellation; never directly force a venue status |
| Reporting | Read dashboards, analytics, exports, notifications, and audit events subject to role permissions |
| Operations | Read integration and reconciliation health; list/resolve authorized exceptions; expose authenticated readiness only to internal callers |
| Webhooks | Receive TradingView alerts at a dedicated, signed endpoint; no authenticated user session required |

List endpoints accept `cursor`, `limit` (default 50, maximum 200), explicit filters, and descending `created_at` order. Mutating endpoints require `Idempotency-Key`; actions acting on an existing revision require `If-Match` or an equivalent version field. Standard errors are `validation_error`, `authentication_required`, `forbidden`, `not_found`, `conflict`, `rate_limited`, `risk_rejected`, `dependency_unavailable`, and `internal_error`.

## Critical workflows

### TradingView signal to order

1. Receive alert and reject unless HTTPS, valid signature, current timestamp, nonce unused, known source, and supported schema.
2. Persist raw encrypted payload reference, normalized signal, and idempotency record atomically.
3. Resolve active strategy version; reject stale, paused, or unauthorized strategies.
4. Evaluate the strategy deterministically; create a `no_action`, `invalid`, or `proposed` decision.
5. For a proposal, capture account/position/balance/market snapshots and ask risk for assessment.
6. If accepted or reduced, create one order intent and reserve exposure atomically. If rejected, notify according to preference and retain reasons.
7. Execution assigns client order ID, submits once, and records acknowledgement or `submission_unknown`.
8. Reconciliation updates order, fills, balances, positions, reservations, projections, and notifications from venue truth.

### Manual order

Manual orders follow the same order-intent, risk, execution, and reconciliation path. The only difference is source provenance (`manual`) and interactive confirmation; a user cannot invoke a direct execution bypass.

### Kill switch

Global, tenant, account, and strategy kill switches can only increase restrictions. Activating a switch immediately prevents new exposure-increasing intents, cancels eligible open orders according to policy, creates high-priority audit and notification events, and preserves current positions for authorized close-only action. Deactivation requires authorized approval, recent authentication, dependency health, and a recorded reason.

### Venue and strategy edge conditions

Before decisioning, reject or defer input for missing/late/out-of-order signals, duplicate source IDs, inactive or expired instruments, market-data gaps, venue maintenance, unacceptable clock skew, unverified account state, conflicting strategy scope, or unavailable collateral. Expiry, delisting, trading halts, changed instrument precision, funding/margin events, reduce-only constraints, partial fills, position flips, and manual venue actions are reconciled as venue facts and re-evaluated by risk before any new exposure. Only one active strategy may own a configured exclusive `(account, instrument, direction)` scope; any competing strategy is rejected until an explicit allocation policy exists.

## Operational defaults

The platform opens in paper mode. Default account currency and timezone are explicit organization settings. Signals older than 60 seconds are stale unless a strategy declares a shorter threshold; no strategy may declare a longer threshold without risk approval. Rate limits and quantitative exposure limits are configured values, not hard-coded constants. Production secrets are only available through managed runtime identity. Logs retain correlation IDs but redact credentials, tokens, raw authorization headers, and personal data not needed for operations.

## Acceptance gates

Before a feature is marked ready, its owner supplies: requirement traceability; threat and abuse cases; API or event contract; migration and rollback plan; unit/integration/contract coverage; observability fields and alerts; accessibility acceptance where user-facing; operational runbook; and owner approval. Before live trading, add sandbox evidence, reconciliation failure drills, risk-owner approval, security review, legal/compliance approval, on-call coverage, and a successful kill-switch drill.

## Future work

Add exact quantitative risk defaults after risk-owner approval; publish formal OpenAPI and JSON Schema artifacts; specify legal jurisdictions, exchange onboarding, and data residency; and record vendor decisions as ADRs.

## Related documents

- [Master Index](00_MASTER_INDEX.md)
- [Architecture](03_ARCHITECTURE.md)
- [Database Design](05_DATABASE.md)
- [API Standards](06_API.md)
- [Risk Engine](09_RISK_ENGINE.md)
- [Security](18_SECURITY.md)
- [Testing Strategy](19_TESTING.md)
- [Project Review](PROJECT_REVIEW.md)
