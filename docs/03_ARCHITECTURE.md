# Architecture

## Table of Contents

- [Purpose](#purpose)
- [Scope](#scope)
- [Logical architecture](#logical-architecture)
- [Critical flows](#critical-flows)
- [Architecture principles](#architecture-principles)
- [Deployment topology](#deployment-topology)
- [Data ownership](#data-ownership)
- [Future work](#future-work)
- [Related documents](#related-documents)

## Purpose

Describe the target architecture and the safety boundaries governing automated execution.

## Scope

This is a logical design, not an implementation prescription. Concrete services and vendors require ADR approval.

## Logical architecture

The experience layer serves web and operator workflows. The platform layer provides identity, configuration, strategy, decision, risk, execution, notification, and analytics capabilities. An integration boundary isolates TradingView, Delta Exchange, and market-data providers. A durable event and relational data layer provides state, auditability, reporting, and replay. Observability spans every boundary.

## Critical flows

Signals are authenticated, normalized, deduplicated, and persisted. Strategy evaluation produces a proposed intent with versioned inputs. The risk engine independently accepts, reduces, or rejects it. Only accepted intents reach the execution adapter, which records a client order identifier before submission and reconciles exchange state asynchronously. UI views read derived, tenant-scoped projections rather than exchange responses directly.

## Architecture principles

Separate decision from execution; use explicit state machines; make writes idempotent; retain immutable audit events; prevent external systems from bypassing risk; and degrade to read-only or halted execution when dependencies are uncertain.

## Deployment topology

Deploy a stateless web/API tier behind a TLS-terminating edge, worker processes for asynchronous ingestion/execution/projection, a transactional relational database, a durable queue or event transport, managed secret storage, and centralized telemetry. Workers consume durable outbox events; no request handler waits for venue completion. Production access is through identity-aware administration paths, not shared credentials. The first release is single-region with documented backup and recovery; cross-region active execution is out of scope until reconciliation semantics are proven.

## Data ownership

The transactional database owns commands, state machines, audit events, and the outbox. The execution adapter owns only normalized venue communication, not business policy. Read projections own dashboard and analytics views and may be rebuilt from events. External exchange state is authoritative for venue acknowledgement and fills; internal state is authoritative for intent, policy, and provenance. See [Implementation Blueprint](23_IMPLEMENTATION_BLUEPRINT.md) for mandatory boundaries and state names.

## Future work

Produce C4 diagrams, sequence diagrams, ADRs, capacity plans, and per-service SLOs.

## Related documents

- [Database](05_DATABASE.md)
- [API](06_API.md)
- [Risk Engine](09_RISK_ENGINE.md)
- [Deployment](17_DEPLOYMENT.md)
- [Implementation Blueprint](23_IMPLEMENTATION_BLUEPRINT.md)
