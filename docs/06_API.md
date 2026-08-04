# API Standards

## Table of Contents

- [Purpose](#purpose)
- [Scope](#scope)
- [Contract standards](#contract-standards)
- [Safety and lifecycle](#safety-and-lifecycle)
- [Authentication and authorization](#authentication-and-authorization)
- [Resource conventions](#resource-conventions)
- [Minimum endpoint inventory](#minimum-endpoint-inventory)
- [Future work](#future-work)
- [Related documents](#related-documents)

## Purpose

Establish public, internal, and webhook contract rules for a safe platform API.

## Scope

Applies to user-facing APIs, service-to-service interfaces, and inbound provider webhooks.

## Contract standards

APIs use versioned resource contracts, explicit schemas, UTC timestamps, stable error codes, pagination, correlation IDs, and documented rate limits. Authentication determines tenant context server-side; clients may never select another tenant. Commands that may create orders require an idempotency key and return accepted, rejected, or pending—not an assumed fill.

## Safety and lifecycle

Validate syntax, authorization, instrument eligibility, and risk state before accepting execution-related commands. Webhooks verify signatures, timestamp freshness, replay protection, and schema version. Deprecations require advance notice, compatibility testing, and published migration guidance.

## Authentication and authorization

Browser sessions use secure, HTTP-only, same-site cookies with CSRF protection; programmatic access uses short-lived bearer tokens with explicit scopes. The server resolves membership and tenant context from the credential. Service identities use workload identity and least-privilege scopes. Every response includes `X-Request-Id`; clients may supply one for correlation subject to validation. Authentication failure is never distinguishable from authorization failure in a way that reveals protected tenant data.

## Resource conventions

Use plural nouns for resources and action subpaths only for stateful commands: `/strategies/{id}:pause`, `/risk-policies/{id}:activate`, `/orders/{id}:cancel`. Return `201` for synchronously created resources, `202` for accepted asynchronous work, `200` for reads/updates, and `204` only where no response representation is useful. The initial complete endpoint inventory and error vocabulary are authoritative in [Implementation Blueprint](23_IMPLEMENTATION_BLUEPRINT.md); formal OpenAPI is a required implementation artifact.

## Minimum endpoint inventory

Identity endpoints cover sign-in/out, MFA enrollment/verification, account recovery, sessions, and scoped API-token lifecycle. Organization endpoints cover organization settings, membership invite/accept/change/remove, and active context. Trading endpoints cover connections, accounts, instruments, market-data health, strategies/versions/approvals, signals/decisions, risk policies/assignments/simulations/kill switches, order intents/orders/fills/positions/balances, and reconciliation exceptions. Experience endpoints cover dashboard, analytics, exports, notification preferences/deliveries, audit events, profile/security settings, and challenges. Internal endpoints expose liveness, readiness, metrics, scheduled-job status, and integration health only behind service authentication. The only unauthenticated business endpoint is the signed TradingView webhook.

## Future work

Publish OpenAPI/event schemas, error taxonomy, API change policy, and consumer contract tests.

## Related documents

- [Architecture](03_ARCHITECTURE.md)
- [TradingView Agent](10_TRADINGVIEW_AGENT.md)
- [Delta Exchange](11_DELTA_EXCHANGE.md)
- [Implementation Blueprint](23_IMPLEMENTATION_BLUEPRINT.md)
