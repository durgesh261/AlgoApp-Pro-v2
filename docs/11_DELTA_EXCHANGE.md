# Delta Exchange Integration

## Table of Contents

- [Purpose](#purpose)
- [Scope](#scope)
- [Integration contract](#integration-contract)
- [Execution lifecycle](#execution-lifecycle)
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

## Future work

Validate current API capabilities, rate limits, order semantics, sandbox coverage, and incident contacts against official Delta Exchange documentation.

## Related documents

- [Risk Engine](09_RISK_ENGINE.md)
- [Database](05_DATABASE.md)
- [Deployment](17_DEPLOYMENT.md)
