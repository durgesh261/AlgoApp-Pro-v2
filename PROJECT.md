# Project Charter — AlgoApp Pro v2

## Table of Contents

- [Purpose](#purpose)
- [Scope](#scope)
- [Operating principles](#operating-principles)
- [Decision governance](#decision-governance)
- [Future work](#future-work)
- [Related documents](#related-documents)

## Purpose

This charter establishes the engineering, product, and risk intent for AlgoApp Pro v2: a reliable trading platform that treats capital protection, auditability, and user trust as first-class requirements.

## Scope

The project covers market-data ingestion, strategy lifecycle management, decisioning, order execution through Delta Exchange, user dashboards, analytics, notifications, deployment, and operational controls. It excludes discretionary advice, unmanaged third-party execution, and storing customer exchange secrets in plaintext.

## Operating principles

- Safety precedes opportunity: a risk control may reject any proposed order.
- Every material action is attributable, time-stamped, and auditable.
- Services fail closed for execution and fail visibly for observation.
- Contracts, metrics, and runbooks are part of the product.
- Environments and credentials are isolated by least privilege.

## Decision governance

Product owns customer outcomes; Engineering owns technical design; Risk owns limits and kill-switch policy; Security owns threat-model acceptance; Operations owns production readiness. Material changes require a written decision record linked from [Architecture](docs/03_ARCHITECTURE.md).

## Future work

Define named owners, service-level objectives, regulatory jurisdiction, and a formal architecture decision record process.

## Related documents

- [Product Vision](docs/01_PRODUCT_VISION.md)
- [Risk Engine](docs/09_RISK_ENGINE.md)
- [Security](docs/18_SECURITY.md)
