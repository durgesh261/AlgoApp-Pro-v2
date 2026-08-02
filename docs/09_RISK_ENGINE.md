# Risk Engine

## Table of Contents

- [Purpose](#purpose)
- [Scope](#scope)
- [Risk controls](#risk-controls)
- [Enforcement and audit](#enforcement-and-audit)
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

## Future work

Set quantitative defaults with risk leadership, model correlated exposure, and rehearse kill-switch recovery.

## Related documents

- [Decision Engine](08_DECISION_ENGINE.md)
- [Delta Exchange](11_DELTA_EXCHANGE.md)
- [Security](18_SECURITY.md)
