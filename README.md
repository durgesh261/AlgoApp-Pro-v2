# AlgoApp Pro v2

AlgoApp Pro v2 is the proposed production-grade algorithmic trading platform for research, controlled execution, risk governance, and operational visibility. This repository intentionally contains architecture and delivery documentation only; it contains no application source code.

## Table of Contents

- [Purpose](#purpose)
- [Scope](#scope)
- [Documentation](#documentation)
- [Product boundaries](#product-boundaries)
- [Getting started](#getting-started)
- [Governance](#governance)
- [Future work](#future-work)
- [Related documents](#related-documents)

## Purpose

Provide the repository entry point, product boundary, and governed reading path for engineers building AlgoApp Pro v2.

## Scope

This repository defines the platform documentation baseline. It does not contain implementation code, deployment credentials, exchange keys, or financial advice.

## Documentation

Start with the [master index](docs/00_MASTER_INDEX.md). For implementation, read the [Implementation Blueprint](docs/23_IMPLEMENTATION_BLUEPRINT.md) after the Product Requirements and Architecture; it defines the agreed cross-cutting contracts and defaults.

## Product boundaries

The platform is designed for authenticated users trading only through approved broker or exchange integrations. It supports strategy research, signal evaluation, paper trading, live trading subject to controls, analytics, and challenges. It is not investment advice, a custody service, or a guarantee of performance.

## Getting started

1. Read [PROJECT.md](PROJECT.md) for project governance and decision principles.
2. Configure only non-secret local settings from [.env.example](.env.example); never commit credentials.
3. Use [docs/22_MASTER_PROMPT.md](docs/22_MASTER_PROMPT.md) as the implementation-planning guardrail.

## Governance

Changes must preserve the controls in [Security](docs/18_SECURITY.md), [Risk Engine](docs/09_RISK_ENGINE.md), and [Coding Rules](docs/20_CODING_RULES.md). Architecture decisions require documented rationale and review by designated technical and risk owners.

## Future work

Create source modules only after roadmap gates, threat model, data contracts, and test strategy have been approved.

## Related documents

- [Master Index](docs/00_MASTER_INDEX.md)
- [Architecture](docs/03_ARCHITECTURE.md)
- [Roadmap](docs/21_ROADMAP.md)
