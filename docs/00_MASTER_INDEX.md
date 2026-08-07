# Documentation Master Index

## Table of Contents

- [Purpose](#purpose)
- [Scope](#scope)
- [Reading paths](#reading-paths)
- [Document catalogue](#document-catalogue)
- [Future work](#future-work)
- [Related documents](#related-documents)

## Purpose

This index is the authoritative entry point for the QuantEdge AI documentation system and defines intended reading order and ownership boundaries.

## Scope

It covers product, architecture, governance, operations, and delivery documentation. It does not replace implementation-level runbooks or formal compliance advice.

## Reading paths

- Executives and product: [Vision](01_PRODUCT_VISION.md) → [Requirements](02_PRODUCT_REQUIREMENTS.md) → [Roadmap](21_ROADMAP.md).
- Engineers: [Architecture](03_ARCHITECTURE.md) → [Tech Stack](04_TECH_STACK.md) → [API](06_API.md) → [Coding Rules](20_CODING_RULES.md).
- Risk and operations: [Risk Engine](09_RISK_ENGINE.md) → [Security](18_SECURITY.md) → [Deployment](17_DEPLOYMENT.md) → [Testing](19_TESTING.md).

## Document catalogue

| Area | Documents |
| --- | --- |
| Product | [Vision](01_PRODUCT_VISION.md), [Requirements](02_PRODUCT_REQUIREMENTS.md), [UI/UX](12_UI_UX.md), [Design System](DESIGN_SYSTEM.md), [Roadmap](21_ROADMAP.md) |
| Platform | [Architecture](03_ARCHITECTURE.md), [Tech Stack](04_TECH_STACK.md), [Database](05_DATABASE.md), [API](06_API.md) |
| Trading | [Strategy](07_STRATEGY_ENGINE.md), [Decision](08_DECISION_ENGINE.md), [Risk](09_RISK_ENGINE.md), [TradingView](10_TRADINGVIEW_AGENT.md), [Delta](11_DELTA_EXCHANGE.md), [Strategy Specification](STRATEGY_SPECIFICATION.md), [Indicator Reverse Engineering](INDICATOR_REVERSE_ENGINEERING.md) |
| Experience | [Dashboard](13_DASHBOARD.md), [Analytics](14_ANALYTICS.md), [Challenge](15_CHALLENGE.md), [Notifications](16_NOTIFICATIONS.md) |
| Assurance | [Deployment](17_DEPLOYMENT.md), [Security](18_SECURITY.md), [Testing](19_TESTING.md), [Coding Rules](20_CODING_RULES.md) |
| Delivery | [Master Prompt](22_MASTER_PROMPT.md) |
| Implementation baseline | [Implementation Blueprint](23_IMPLEMENTATION_BLUEPRINT.md) |
| Architecture review | [Project Review](PROJECT_REVIEW.md), [Project Audit](PROJECT_AUDIT.md), [UI Audit](UI_AUDIT.md) |

## Document authority

[Implementation Blueprint](23_IMPLEMENTATION_BLUEPRINT.md) is the cross-cutting implementation baseline. Product intent is owned by [Product Vision](01_PRODUCT_VISION.md) and [Product Requirements](02_PRODUCT_REQUIREMENTS.md); concrete interface, persistence, execution, and control decisions are owned by their respective domain documents. Where documents disagree, the order of precedence is: approved ADR, Security/Risk policy, Implementation Blueprint, domain specification, then product document. Ambiguities must be resolved in an ADR before implementation.

## Future work

Add ADRs, service runbooks, incident playbooks, data-retention schedules, and regulatory mappings as the product enters implementation.

## Related documents

- [Project Charter](../PROJECT.md)
- [Repository README](../README.md)
- [Architecture](03_ARCHITECTURE.md)
- [Strategy Specification](STRATEGY_SPECIFICATION.md)
- [Indicator Reverse Engineering](INDICATOR_REVERSE_ENGINEERING.md)
