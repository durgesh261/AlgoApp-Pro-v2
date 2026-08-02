# Dashboard

## Table of Contents

- [Purpose](#purpose)
- [Scope](#scope)
- [Dashboard information model](#dashboard-information-model)
- [Data freshness and safety](#data-freshness-and-safety)
- [Views and permissions](#views-and-permissions)
- [Metric definitions](#metric-definitions)
- [Operational dashboard](#operational-dashboard)
- [Future work](#future-work)
- [Related documents](#related-documents)

## Purpose

Define the primary operational view for users and authorized support staff.

## Scope

The dashboard summarizes state; it does not substitute for exchange statements or risk review.

## Dashboard information model

At a glance, display environment, account health, balances, equity, realized/unrealized P&L, positions, open orders, risk utilization, active strategies, recent decisions, alerts, and data freshness. Detail views drill into lifecycle history and immutable audit references. Filters persist safely within tenant context.

## Data freshness and safety

Every market-derived metric states its observation time and source. Unknown or delayed data is explicit and never rendered as current. P&L methodology, currencies, fees, and timezone are visible. Sensitive values respect role permissions and session protections.

## Views and permissions

The account overview is the default view; it shows equity, balances, risk utilization, positions, open orders, recent fills, execution health, and critical alerts. Strategy detail shows version, status, decisions, risk outcomes, and attributable execution. Operator views additionally show integration health and quarantined events but never reveal raw credentials. Viewer roles cannot access sensitive account identifiers, exports, or action controls. All filters are tenant-scoped and reflected in share-safe URLs only when authorized.

## Metric definitions

Equity is current balance plus mark-to-market position value using the stated price source. Realized P&L includes closed-trade results and fees according to the declared accounting method; unrealized P&L is explicitly estimated. Risk utilization is approved current and pending exposure divided by active policy limit, not available exchange margin. When a metric cannot be calculated, render `Unavailable` with cause and observation time rather than zero.

## Operational dashboard

Authorized operators need a separate view of ingestion latency, queue age and dead-letter count, worker success/failure rate, webhook validation/rejection rate, market-data freshness, venue connectivity and rate-limit state, reconciliation age/variance, unknown-order count, kill-switch state, notification delivery failures, and backup/restore drill status. This view contains no customer credentials and supports drill-down only through audited, role-gated links.

## Future work

Specify dashboard wireframes, query performance targets, role variants, and export controls.

## Related documents

- [UI/UX](12_UI_UX.md)
- [Analytics](14_ANALYTICS.md)
- [Risk Engine](09_RISK_ENGINE.md)
- [Implementation Blueprint](23_IMPLEMENTATION_BLUEPRINT.md)
