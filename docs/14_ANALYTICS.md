# Analytics

## Table of Contents

- [Purpose](#purpose)
- [Scope](#scope)
- [Metrics and methodology](#metrics-and-methodology)
- [Trust and governance](#trust-and-governance)
- [Future work](#future-work)
- [Related documents](#related-documents)

## Purpose

Define reliable performance, execution, and operational analytics.

## Scope

Analytics supports insight and reconciliation; it does not make unqualified performance claims.

## Metrics and methodology

Report realized and unrealized P&L, equity curve, drawdown, win rate, profit factor, turnover, exposure, fill rate, slippage, fees, latency, and strategy attribution. Every metric declares its calculation window, timezone, currency conversion source, inclusion rules, and whether it is estimated or final. Results can be filtered by account, strategy version, instrument, and mode.

## Trust and governance

Derived data is traceable to orders, fills, positions, and market snapshots. Revisions are versioned. Exports are permissioned, watermarked where necessary, and auditable. Display appropriate risk and past-performance disclaimers.

## Future work

Document formulas, benchmark methodology, correction workflows, and warehouse data contracts.

## Related documents

- [Database](05_DATABASE.md)
- [Dashboard](13_DASHBOARD.md)
- [Testing](19_TESTING.md)
