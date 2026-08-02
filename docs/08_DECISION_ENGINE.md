# Decision Engine

## Table of Contents

- [Purpose](#purpose)
- [Scope](#scope)
- [Decision contract](#decision-contract)
- [Evaluation rules](#evaluation-rules)
- [Future work](#future-work)
- [Related documents](#related-documents)

## Purpose

Define deterministic conversion of a valid strategy event into a proposed trading intent.

## Scope

The decision engine does not own risk policy or exchange connectivity.

## Decision contract

Every decision contains source event identity, strategy version, account and instrument context, side, proposed quantity, order preference, expiry, confidence or rationale, and a reproducibility snapshot. Outcomes are no-action, propose, or invalid; decisions never silently mutate after persistence.

## Evaluation rules

Inputs must be fresh, complete, normalized, and associated with an active strategy version. Evaluation is deterministic for a given input snapshot and idempotent per strategy-event key. Ambiguous, stale, duplicate, or unsupported inputs produce an explainable non-trading outcome.

## Future work

Specify decision schema, clock-skew policy, replay service, and human-review thresholds.

## Related documents

- [Strategy Engine](07_STRATEGY_ENGINE.md)
- [Risk Engine](09_RISK_ENGINE.md)
- [Database](05_DATABASE.md)
