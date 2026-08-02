# TradingView Agent

## Table of Contents

- [Purpose](#purpose)
- [Scope](#scope)
- [Signal ingestion](#signal-ingestion)
- [Reliability controls](#reliability-controls)
- [Canonical alert contract](#canonical-alert-contract)
- [Failure handling](#failure-handling)
- [Source governance](#source-governance)
- [Future work](#future-work)
- [Related documents](#related-documents)

## Purpose

Define a secure inbound boundary for TradingView-originated alerts.

## Scope

The agent accepts signals; it does not authorize or place trades on its own.

## Signal ingestion

Each alert is mapped to a registered strategy and schema version. The receiver authenticates the shared secret or signed payload, validates source identity, enforces timestamp and nonce rules, normalizes symbols/timeframes, records the raw payload securely, and publishes a canonical signal event.

## Reliability controls

Duplicate delivery is expected and harmless through idempotency keys. Invalid, stale, unregistered, or rate-limited alerts are quarantined with diagnostic reason codes. Monitoring measures delivery lag, rejection rate, and schema mismatch. Secrets rotate without downtime.

## Canonical alert contract

The supported alert fields are `schema_version`, `alert_id`, `strategy_key`, `observed_at`, `symbol`, `timeframe`, `event_type`, `close_price`, and a signed payload or shared-secret credential. `alert_id` is unique per source and is the primary idempotency key. The receiver maps external symbol to an approved internal instrument; it never accepts a symbol supplied by an alert without registration. Payload extensions are ignored only when schema policy permits; unknown required fields reject the alert.

## Failure handling

Return a non-sensitive acknowledgement only after durable receipt. Invalid alerts receive a safe client error; internal processing failure receives retryable server failure only when no durable idempotency record exists. Quarantined events are visible to authorized operators with redacted payload views and may be replayed through the same validation path. No webhook retry may create a second decision or order intent.

## Source governance

Each registered TradingView source has a tenant, strategy binding, allowed IP or network policy where feasible, active secret version, permitted schema versions, instrument mapping, maximum timestamp skew, and rotation history. Secret rotation supports current and previous values for a short overlap window and records which version validated each alert. A single alert may target one registered strategy only; fan-out requires separately registered source bindings to keep audit and risk attribution unambiguous.

## Future work

Document exact alert schema, signature format, replay tooling, and provider outage behavior.

## Related documents

- [API](06_API.md)
- [Strategy Engine](07_STRATEGY_ENGINE.md)
- [Security](18_SECURITY.md)
- [Implementation Blueprint](23_IMPLEMENTATION_BLUEPRINT.md)
