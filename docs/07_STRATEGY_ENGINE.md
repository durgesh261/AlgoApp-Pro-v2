# Strategy Engine

## Table of Contents

- [Purpose](#purpose)
- [Scope](#scope)
- [Strategy lifecycle](#strategy-lifecycle)
- [Controls](#controls)
- [Strategy definition](#strategy-definition)
- [Validation and approval](#validation-and-approval)
- [Edge-case policy](#edge-case-policy)
- [Future work](#future-work)
- [Related documents](#related-documents)

## Purpose

Define how trading strategies are specified, versioned, evaluated, and governed.

## Scope

The engine produces proposed intents. It does not directly submit orders.

## Strategy lifecycle

A strategy moves through the canonical `draft`, `validated`, `paper_enabled`, `live_approved`, `paused`, `retired`, and `archived` states. Each immutable version declares instruments, timeframe, signal source, entry/exit conditions, sizing inputs, and required risk policy. Evaluation records the exact version, input snapshot, calculation timestamp, and resulting rationale.

## Controls

Strategies are tenant-scoped, least-privilege authorized, and subject to rate, freshness, instrument, and version checks. Changes require validation and approval before live use. Historical simulation and paper-trading results are labelled as non-predictive evidence.

## Strategy definition

A versioned strategy definition contains a name, description, owner, eligible account class, instrument allow-list, signal schema, input freshness threshold, deterministic rule configuration, sizing method, order preference, time-in-force, expiry policy, and assigned risk policy. Definitions may not embed credentials, executable user code, arbitrary network calls, or direct order instructions. The initial implementation should use declarative, reviewable rules; a general-purpose scripting runtime is out of scope.

## Validation and approval

Validation proves schema compatibility, allowed instruments, bounded quantities, valid rule expressions, and risk-policy assignment. Paper enablement requires validation plus owner approval. Live approval requires a separate immutable approval by an Owner or Admin with recent authentication, paper evidence, an active connection, and a live-compatible risk policy. Pausing is immediate; retiring blocks new evaluation but preserves history. The exact lifecycle is defined in the [Implementation Blueprint](23_IMPLEMENTATION_BLUEPRINT.md).

## Edge-case policy

Strategies must define behavior for stale/missing input, duplicate and out-of-order alerts, venue maintenance, instrument expiry or delisting, changed tick/lot precision, price gaps, partial fills, cancellation races, funding/margin events, account disconnection, and queued work after pause. The default is no new exposure: reject or defer the signal with a reason. A strategy cannot flip a position, pyramid, average down, or submit a reduce-only/close action unless those behaviors are explicitly declared and accepted by its risk policy. Conflicting strategies may not control the same exclusive account-instrument-direction scope.

## Future work

Define a safe strategy DSL, validation rules, backtest protocol, approval workflow, and performance attribution model.

## Related documents

- [Decision Engine](08_DECISION_ENGINE.md)
- [Risk Engine](09_RISK_ENGINE.md)
- [Challenge](15_CHALLENGE.md)
- [Implementation Blueprint](23_IMPLEMENTATION_BLUEPRINT.md)
