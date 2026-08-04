# Delta Exchange Integration

## Table of Contents

- [Purpose](#purpose)
- [Scope](#scope)
- [Integration contract](#integration-contract)
- [Execution lifecycle](#execution-lifecycle)
- [Adapter responsibilities](#adapter-responsibilities)
- [Reconciliation policy](#reconciliation-policy)
- [Provider-specific constraints](#provider-specific-constraints)
- [Official references](#official-references)
- [Future work](#future-work)
- [Related documents](#related-documents)

## Purpose

Define the exchange-adapter boundary for Delta Exchange execution and reconciliation.

## Scope

This integration is venue-specific and must remain isolated behind platform execution interfaces.

## Integration contract

The adapter owns authenticated venue requests, instrument metadata, account snapshots, order submission/cancel/amend operations where supported, and exchange event normalization. Credentials reside in a managed secrets service and are scoped per tenant/account. Provider documentation and sandbox behavior must be verified during implementation.

## Execution lifecycle

Accepted risk intents receive a durable client order ID before one bounded submission attempt. Timeouts are unknown outcomes, not failures; the reconciler queries or subscribes to venue state before retrying. The system records acknowledgements, rejects, fills, cancels, fees, and terminal reconciliation status. Manual venue changes are detected and surfaced.

## Adapter responsibilities

The adapter translates internal instruments, precision, order types, sides, time-in-force, and error codes to venue-specific values. Before an account becomes active, it verifies credential scope, environment, account identity, supported instruments, and server time tolerance. It maintains rate-limit state and exposes health without disclosing credentials. It does not calculate risk, accept unapproved intents, or derive P&L. Exchange-specific fields remain in a namespaced raw metadata record while normalized facts populate core order and fill records.

## Reconciliation policy

Subscribe to venue updates when supported and poll as a correctness backstop. Reconcile newly submitted and non-terminal orders at a short interval, then run periodic account-level balance/position reconciliation. On disagreement, mark the internal record `unknown` or `degraded`, block new exposure-increasing orders as applicable, retain both observed values, alert operators, and resolve through an auditable workflow. Sandbox certification must cover duplicate acknowledgements, rate limits, partial fills, cancellation races, and request timeouts before live approval.

## Provider-specific constraints

The current Delta Exchange India REST documentation requires authenticated account and trading requests to include API key, HMAC signature, timestamp, and a User-Agent; timestamp validity is narrow, so runtime clock synchronization is mandatory. The adapter uses the venue `client_order_id` for correlation and enforces its documented 32-character maximum. It treats HTTP 429 as a backoff condition and reads the rate-limit reset header before scheduling a retry. The documented default authenticated quota is a fixed five-minute window; implementation must use provider response headers rather than assume this remains constant.

Private WebSocket sessions use the current `key-auth` handshake and subscribe to orders, positions, and wallet/account-relevant updates after successful authentication. The adapter must use the documented testnet endpoints for sandbox and production endpoints only in approved live environments. Delta has announced retirement of legacy public WebSocket channels; before production rollout, validate the then-current endpoint and channel matrix against the provider changelog, subscribe to venue system-status events, and retain REST polling as the correctness backstop.

## Official references

Implementation owners must review the current [Delta Exchange API documentation](https://docs.delta.exchange/) and its changelog at the time of release. The platform’s normalization rules remain authoritative when provider documentation changes; any breaking provider change requires an ADR, contract-test update, and sandbox recertification.

## Future work

Validate current API capabilities, rate limits, order semantics, sandbox coverage, and incident contacts against official Delta Exchange documentation.

## Related documents

- [Risk Engine](09_RISK_ENGINE.md)
- [Database](05_DATABASE.md)
- [Deployment](17_DEPLOYMENT.md)
- [Implementation Blueprint](23_IMPLEMENTATION_BLUEPRINT.md)
