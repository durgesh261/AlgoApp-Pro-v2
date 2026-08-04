# Decision Engine

## Table of Contents

- [Purpose](#purpose)
- [Scope](#scope)
- [Decision contract](#decision-contract)
- [Evaluation rules](#evaluation-rules)
- [Decision algorithm](#decision-algorithm)
- [Reproducibility](#reproducibility)
- [Conflict and expiry policy](#conflict-and-expiry-policy)
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

## Decision algorithm

Load the strategy version pinned to the signal, validate the account and instrument context, compare signal time against the strategy freshness threshold, and evaluate declared conditions using a captured input snapshot. Emit one of: `no_action` when conditions are not met, `invalid` when validation cannot produce a trustworthy result, or `proposed` with a fully specified order proposal. Quantity calculation is bounded by strategy configuration but is not an authorization; the risk engine is the only authority that can reduce or permit exposure.

## Reproducibility

Persist the strategy version identifier, normalized signal, market inputs with source timestamps, resulting output, rule trace, and content hash. Replays use that captured snapshot, never current market state, and return the original outcome or a flagged incompatibility. Model scores or non-deterministic features are excluded from the initial execution decision path unless their version, inputs, and deterministic fallback are documented and approved.

## Conflict and expiry policy

An otherwise valid decision expires when its strategy-specific expiry is reached or required market/account snapshot freshness is lost. The default decision expiry is 30 seconds, bounded by the 60-second signal maximum. Decisioning serializes per exclusive account-instrument-direction scope to prevent simultaneous contradictory proposals. A later signal does not overwrite an earlier immutable decision; it creates its own decision and risk evaluates against current reservations. Decision replay is analytical only and must never emit an execution command.

## Future work

Specify decision schema, clock-skew policy, replay service, and human-review thresholds.

## Related documents

- [Strategy Engine](07_STRATEGY_ENGINE.md)
- [Risk Engine](09_RISK_ENGINE.md)
- [Database](05_DATABASE.md)
- [Implementation Blueprint](23_IMPLEMENTATION_BLUEPRINT.md)
