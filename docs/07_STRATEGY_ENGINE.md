# Strategy Engine

## Table of Contents

- [Purpose](#purpose)
- [Scope](#scope)
- [Strategy lifecycle](#strategy-lifecycle)
- [Controls](#controls)
- [Future work](#future-work)
- [Related documents](#related-documents)

## Purpose

Define how trading strategies are specified, versioned, evaluated, and governed.

## Scope

The engine produces proposed intents. It does not directly submit orders.

## Strategy lifecycle

A strategy moves through draft, validated, paper-enabled, live-approved, paused, retired, and archived states. Each immutable version declares instruments, timeframe, signal source, entry/exit conditions, sizing inputs, and required risk policy. Evaluation records the exact version, input snapshot, calculation timestamp, and resulting rationale.

## Controls

Strategies are tenant-scoped, least-privilege authorized, and subject to rate, freshness, instrument, and version checks. Changes require validation and approval before live use. Historical simulation and paper-trading results are labelled as non-predictive evidence.

## Future work

Define a safe strategy DSL, validation rules, backtest protocol, approval workflow, and performance attribution model.

## Related documents

- [Decision Engine](08_DECISION_ENGINE.md)
- [Risk Engine](09_RISK_ENGINE.md)
- [Challenge](15_CHALLENGE.md)
