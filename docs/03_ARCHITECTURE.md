# Architecture Specification

## Table of Contents

- [Purpose](#purpose)
- [Scope](#scope)
- [Physical Monorepo Architecture](#physical-monorepo-architecture)
- [Desktop Trading Terminal Layout Architecture](#desktop-trading-terminal-layout-architecture)
- [Logical Architecture](#logical-architecture)
- [Critical Flows](#critical-flows)
- [Architecture Principles](#architecture-principles)
- [Deployment Topology](#deployment-topology)
- [Data Ownership](#data-ownership)
- [Future Work](#future-work)
- [Related Documents](#related-documents)

## Purpose

Describe the target architecture, single-user monorepo structure, desktop trading terminal layout, and the safety boundaries governing platform capabilities.

## Scope

Applies to the Phase 1 Single-User Software Foundation baseline through target production execution topology.

## Physical Monorepo Architecture

The platform is structured as a typed npm workspace monorepo:

```text
AlgoApp-Pro-v2/
├── shared/     # Domain contracts, Zod validation, utilities, and constants
├── backend/    # Express, TypeScript, Prisma, Pino logger, feature API modules
├── frontend/   # React, Vite, TailwindCSS, Zustand, Framer Motion, Axios desktop UI
├── docker/     # Docker Compose & multi-stage Dockerfiles
├── scripts/    # Development & build automation scripts
└── tests/      # Vitest unit test and Playwright E2E configurations
```

## Desktop Trading Terminal Layout Architecture

The user experience is built around a desktop-first trading terminal layout:

1. **Top Market Ticker**: High-frequency horizontal market index price ticker.
2. **Header Bar**: Application branding, system health status, single-user environment badges, and `Ctrl+K` Command Palette trigger.
3. **Collapsible Navigation Sidebar**: Direct navigation across the 8 primary feature page surfaces:
   - **Dashboard**: System health overview and metric cards.
   - **Paper Trading**: Simulated execution boundary surface.
   - **Live Trading**: Production execution gate and account limit surface.
   - **Analysis**: Research & technical indicator overlay workspace.
   - **Trade Journal**: Execution logging and post-trade rationale notes.
   - **Analytics**: Performance metrics, equity curves, and drawdown analysis.
   - **Challenge**: Trader challenge rule monitor.
   - **Settings**: Single-user platform settings & emergency kill switch.
4. **Command Palette (`Ctrl+K`)**: Modal overlay for rapid keyboard-driven page navigation and system actions.
5. **Footer Status Bar**: Real-time API latency monitor, PostgreSQL database connection state, and UTC timestamp clock.

## Logical Architecture

The experience layer serves web workflows. The platform layer provides identity, configuration, strategy, decision, risk, execution, notification, and analytics capabilities. An integration boundary isolates TradingView, Delta Exchange, and market-data providers. A relational data layer provides state, auditability, and reporting. Observability spans every boundary.

## Critical Flows

Signals are authenticated, normalized, deduplicated, and persisted. Strategy evaluation produces a proposed intent with versioned inputs. The risk engine independently accepts, reduces, or rejects it. Only accepted intents reach the execution adapter, which records a client order identifier before submission and reconciles exchange state asynchronously. UI views read derived projections rather than exchange responses directly.

## Architecture Principles

Separate decision from execution; use explicit state machines; make writes idempotent; retain immutable audit events; prevent external systems from bypassing risk; and degrade to read-only or halted execution when dependencies are uncertain.

## Deployment Topology

Deploy a web/API tier behind a TLS-terminating ingress, worker processes for asynchronous ingestion/execution/projection, a PostgreSQL relational database, managed secret storage, and centralized telemetry.

## Data Ownership

The transactional database owns commands, state machines, audit events, and outbox records. The execution adapter owns only normalized venue communication, not business policy. Read projections own dashboard and analytics views. External exchange state is authoritative for venue acknowledgement and fills; internal state is authoritative for intent, policy, and provenance. See [Implementation Blueprint](23_IMPLEMENTATION_BLUEPRINT.md) for mandatory boundaries and state names.

## Future Work

Produce C4 diagrams, sequence diagrams, ADRs, capacity plans, and per-service SLOs.

## Related Documents

- [Database Design](05_DATABASE.md)
- [API Standards](06_API.md)
- [Design System Specifications](DESIGN_SYSTEM.md)
- [Implementation Blueprint](23_IMPLEMENTATION_BLUEPRINT.md)
