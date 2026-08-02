# Dashboard

## Table of Contents

- [Purpose](#purpose)
- [Scope](#scope)
- [Dashboard information model](#dashboard-information-model)
- [Data freshness and safety](#data-freshness-and-safety)
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

## Future work

Specify dashboard wireframes, query performance targets, role variants, and export controls.

## Related documents

- [UI/UX](12_UI_UX.md)
- [Analytics](14_ANALYTICS.md)
- [Risk Engine](09_RISK_ENGINE.md)
