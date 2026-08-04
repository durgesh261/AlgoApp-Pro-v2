# Risk Engine

## Table of Contents

- [Purpose](#purpose)
- [Scope](#scope)
- [Risk controls](#risk-controls)
- [Enforcement and audit](#enforcement-and-audit)
- [Evaluation order](#evaluation-order)
- [Policy administration](#policy-administration)
- [Risk data and edge cases](#risk-data-and-edge-cases)
- [Future work](#future-work)
- [Related documents](#related-documents)

## Purpose

Define the independent policy gate that protects accounts, users, and the platform from unacceptable execution.

## Scope

All order intents—including manual and automated intents—must pass this gate before execution.

## Risk controls

Controls include account enablement, allowed instrument and side, maximum order notional, position and leverage caps, open-order limits, daily loss and drawdown limits, concentration limits, price-deviation bands, signal freshness, rate limits, and global/account/strategy kill switches. Policies are versioned and evaluated against current positions, balances, market conditions, and pending exposure.

## Enforcement and audit

The engine returns accept, reduce, defer, or reject with machine-readable codes and user-safe explanations. It reserves exposure before submission, releases or adjusts it during reconciliation, and records policy version and inputs used. Any uncertainty in risk state causes a reject or execution halt.

## Evaluation order

Evaluate in this order: global/tenant/account/strategy kill switches; connection and account mode; authorization and instrument eligibility; signal and market-data freshness; order syntax and price bands; rate/open-order limits; available collateral and leverage; single-order, position, concentration, and pending-exposure limits; then loss/drawdown limits. The first hard failure rejects. A policy may reduce quantity only when the order remains valid at the reduced size; otherwise reject. `deferred` is reserved for a known, bounded dependency wait and must expire into reject unless re-evaluated from fresh snapshots.

## Policy administration

Policies are immutable versioned records assigned explicitly to an account and optionally tightened by strategy. Numeric values include currency, instrument scope, and calculation basis. A new version is validated and simulated before activation; activation never retroactively changes a recorded assessment. Only Owner/Admin roles can activate policy or kill-switch changes, with recent authentication and reason text. Policy changes emit audit and high-priority notification events.

## Risk data and edge cases

Risk decisions require a bounded-age balance, position, open-order, reservation, instrument-rule, and market-price snapshot. Missing or inconsistent inputs reject exposure-increasing orders and permit only explicitly configured close-only behavior. Exposure includes open orders and reservations, not only filled position. Calculate leverage, margin, and liquidation-distance controls with venue-specific metadata; apply the stricter policy when platform and venue constraints differ. A cancelled/expired order releases only its unfilled reservation; partial fills retain filled exposure. Reconciliation variance, margin-call indicators, or venue maintenance automatically degrade the account and block new risk approvals.

## Future work

Set quantitative defaults with risk leadership, model correlated exposure, and rehearse kill-switch recovery.

## Related documents

- [Decision Engine](08_DECISION_ENGINE.md)
- [Delta Exchange](11_DELTA_EXCHANGE.md)
- [Security](18_SECURITY.md)
- [Implementation Blueprint](23_IMPLEMENTATION_BLUEPRINT.md)
