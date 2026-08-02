# Analytics

## Table of Contents

- [Purpose](#purpose)
- [Scope](#scope)
- [Metrics and methodology](#metrics-and-methodology)
- [Trust and governance](#trust-and-governance)
- [Formula baseline](#formula-baseline)
- [Data completion rules](#data-completion-rules)
- [Operational and data-quality analytics](#operational-and-data-quality-analytics)
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

## Formula baseline

Use net P&L = realized trading P&L minus fees and funding where applicable. Return percentage uses a disclosed denominator and is not comparable across accounts unless the denominator and time window match. Maximum drawdown is the greatest peak-to-trough decline in the selected equity series. Fill rate is filled quantity divided by submitted quantity for terminal orders. Slippage is executed price minus arrival reference price, direction-normalized, and is unavailable when no valid reference exists. Profit factor is gross profit divided by absolute gross loss and is `Unavailable` when gross loss is zero.

## Data completion rules

Mark a reporting interval preliminary until all relevant orders are terminal and required venue reconciliation succeeds. Include corrected venue events as revisions with calculation version and refresh time. Never blend paper and live results, currencies, or strategy versions unless the view explicitly asks for a normalized aggregate and states its conversion source. Exports include selected filters, generation time, calculation version, and disclaimer.

## Operational and data-quality analytics

Maintain separate operational metrics for webhook acceptance/latency, decision throughput/outcome, risk rejection reasons, order submission latency, fill/cancel ratio, reconciliation lag/variance, queue age, data freshness, notification delivery, and kill-switch use. Data-quality reports count duplicate, late, quarantined, missing, and corrected events by source and tenant without exposing other tenants. Every metric has owner, refresh target, calculation version, and alert threshold; operational metrics are not merged with investment-performance reporting.

## Future work

Document formulas, benchmark methodology, correction workflows, and warehouse data contracts.

## Related documents

- [Database](05_DATABASE.md)
- [Dashboard](13_DASHBOARD.md)
- [Testing](19_TESTING.md)
- [Implementation Blueprint](23_IMPLEMENTATION_BLUEPRINT.md)
