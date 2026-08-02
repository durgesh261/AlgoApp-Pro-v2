# TradingView Agent

## Table of Contents

- [Purpose](#purpose)
- [Scope](#scope)
- [Signal ingestion](#signal-ingestion)
- [Reliability controls](#reliability-controls)
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

## Future work

Document exact alert schema, signature format, replay tooling, and provider outage behavior.

## Related documents

- [API](06_API.md)
- [Strategy Engine](07_STRATEGY_ENGINE.md)
- [Security](18_SECURITY.md)
