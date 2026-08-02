# Notifications

## Table of Contents

- [Purpose](#purpose)
- [Scope](#scope)
- [Notification policy](#notification-policy)
- [Delivery and privacy](#delivery-and-privacy)
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

## Future work

Define templates, escalation matrix, channel providers, localization, and delivery SLOs.

## Related documents

- [Dashboard](13_DASHBOARD.md)
- [Risk Engine](09_RISK_ENGINE.md)
- [Security](18_SECURITY.md)
