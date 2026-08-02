# Challenge Module

## Table of Contents

- [Purpose](#purpose)
- [Scope](#scope)
- [Challenge lifecycle](#challenge-lifecycle)
- [Fairness and controls](#fairness-and-controls)
- [Rules contract](#rules-contract)
- [Resolution process](#resolution-process)
- [Future work](#future-work)
- [Related documents](#related-documents)

## Purpose

Define optional, rules-based trader challenges for education, engagement, or evaluation.

## Scope

Challenges are a platform feature, not a promise of funding, rewards, or investment performance.

## Challenge lifecycle

A challenge has published eligibility, start/end time, instruments, environment, initial balance, objectives, loss limits, scoring formula, and outcome states. Enrolment snapshots the rule version. Evaluation consumes immutable account and order events, and results retain the evidence needed to explain a score or disqualification.

## Fairness and controls

Rules must be visible before enrolment, timezone-aware, deterministic, resistant to duplicate events, and reviewed for abuse. Risk limits remain in force. Leaderboards minimize personal data and delay or aggregate data where anti-gaming requires it.

## Rules contract

Each published challenge version includes eligibility, start/end instants, account type, permitted instruments, initial equity, leverage and loss limits, objective, scoring calculation, tie-breaker, disqualification rules, visibility, and prize or no-prize statement. Rules use the same normalized order and balance events as analytics. Enrolment snapshots the published version; changes after enrolment create a new challenge version and may not silently alter a participant’s result.

## Resolution process

Disqualifications require reason codes and an auditable event trail. Participants can submit a dispute within a published window; authorized reviewers record evidence, decision, and notification. Suspicious activity is withheld from public ranking until review. This module remains disabled until legal, privacy, fraud, and jurisdictional review are complete.

## Future work

Obtain legal review, define rewards policy, anti-fraud controls, dispute process, and accessibility review.

## Related documents

- [Strategy Engine](07_STRATEGY_ENGINE.md)
- [Analytics](14_ANALYTICS.md)
- [Security](18_SECURITY.md)
- [Implementation Blueprint](23_IMPLEMENTATION_BLUEPRINT.md)
