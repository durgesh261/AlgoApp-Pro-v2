# Notifications

## Table of Contents

- [Purpose](#purpose)
- [Scope](#scope)
- [Notification policy](#notification-policy)
- [Delivery and privacy](#delivery-and-privacy)
- [Event matrix](#event-matrix)
- [Preference and escalation rules](#preference-and-escalation-rules)
- [Future work](#future-work)
- [Related documents](#related-documents)

## Purpose

Define timely, actionable communication for trading, risk, security, and platform events.

## Scope

Applies to in-product, email, push, and future channel delivery.

## Notification policy

Critical events include kill-switch activation, rejected or unknown order state, major risk-limit breach, credential change, and security anomaly. Important events include fills, strategy pause, and connectivity degradation. Informational events are digestible and preference-controlled. Messages state what happened, impact, time, account/strategy context, and safe next action.

## Delivery and privacy

Delivery is asynchronous, idempotent, rate-limited, observable, and retried with a bounded policy. Never include secrets or excessive financial detail in insecure channels. Respect verified contact methods, consent, quiet hours where permitted, and tenant-level retention.

## Event matrix

| Event | Severity | Default delivery | User opt-out |
| --- | --- | --- | --- |
| Kill switch, account compromise, unknown order | Critical | In-product plus verified urgent channel | No for in-product; channel policy applies |
| Risk rejection, strategy paused, connection degraded | Important | In-product; email/push by preference | Yes, except security-required notices |
| Fill, cancellation, daily report | Informational | In-product; digest or push by preference | Yes |

## Preference and escalation rules

Preferences are per tenant, account where relevant, event class, and channel. Critical notices bypass digesting but observe lawful channel consent. Retries use exponential backoff with a finite attempt count; final failure is visible in the dashboard and operational telemetry. A deduplication key includes tenant, recipient, event type, aggregate, and event version. Operators receive integration alerts through a separate internal routing policy.

## Future work

Define templates, escalation matrix, channel providers, localization, and delivery SLOs.

## Related documents

- [Dashboard](13_DASHBOARD.md)
- [Risk Engine](09_RISK_ENGINE.md)
- [Security](18_SECURITY.md)
- [Implementation Blueprint](23_IMPLEMENTATION_BLUEPRINT.md)
