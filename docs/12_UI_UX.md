# UI/UX Standards

## Table of Contents

- [Purpose](#purpose)
- [Scope](#scope)
- [Experience principles](#experience-principles)
- [Safety and accessibility](#safety-and-accessibility)
- [Required workflows](#required-workflows)
- [Content and error standards](#content-and-error-standards)
- [Screen inventory](#screen-inventory)
- [Future work](#future-work)
- [Related documents](#related-documents)

## Purpose

Set interaction standards for clear, trustworthy trading workflows.

## Scope

Applies to web, responsive, and operator interfaces.

## Experience principles

Show the user’s current environment, account, strategy, data freshness, and execution state before asking for action. Use progressive disclosure for complex risk detail. Preserve context after failures. Present consistent status vocabulary: draft, active, paused, pending, accepted, rejected, partially filled, filled, cancelled, and unknown.

## Safety and accessibility

Live trading must be visually distinct from paper mode, and high-impact actions require meaningful confirmation with concise impact summaries. Do not use color as the sole status indicator. Meet keyboard, focus, contrast, semantic-label, reduced-motion, localization, and responsive-layout requirements aligned to WCAG 2.2 AA.

## Required workflows

The initial experience must support organization selection; connection setup and verification; strategy draft/version/validation; paper enablement; live approval; risk-policy review; manual order intent; order and fill detail; kill-switch activation; notification preferences; audit search; and export initiation. Each trading view always shows active organization, account, environment, last data update, and current execution health. Confirmations for live actions state account, instrument, side, quantity, estimated notional, risk result, and irreversible effects.

## Content and error standards

Use plain language for customer-facing messages and stable machine-readable codes for support. State what happened, why it matters, what the user can do, and whether trading is affected. Do not blame users for dependency failures. Empty states teach the next safe action; loading states do not imply current data; unknown state is presented as a safety condition, not a generic error. Financial values include currency and negative-sign conventions.

## Screen inventory

Required screens are: sign-in, MFA enrollment/challenge, recovery, organization selector, onboarding, profile/security/session management, member and role management, connection/account setup, account overview/detail, instrument browser, strategy list/detail/version editor/approval, risk policy list/detail/simulator, manual order ticket/confirmation, order/fill/position history, analytics/report export, notification preferences/inbox, audit trail, challenge list/detail/enrolment, and operator-only integration/reconciliation/incident views. Each has loading, empty, permission-denied, degraded-data, and error states. Operator screens are separately protected and never expose credentials.

## Future work

Create a design system, content style guide, usability test plan, and accessible prototypes.

## Related documents

- [Dashboard](13_DASHBOARD.md)
- [Notifications](16_NOTIFICATIONS.md)
- [Security](18_SECURITY.md)
- [Implementation Blueprint](23_IMPLEMENTATION_BLUEPRINT.md)
