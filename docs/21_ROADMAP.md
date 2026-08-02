# Delivery Roadmap

## Table of Contents

- [Purpose](#purpose)
- [Scope](#scope)
- [Phased delivery](#phased-delivery)
- [Release gates](#release-gates)
- [Definition of done](#definition-of-done)
- [Dependency order](#dependency-order)
- [Future work](#future-work)
- [Related documents](#related-documents)

## Purpose

Describe a risk-led path from documentation to a production-ready platform.

## Scope

The roadmap is outcome-based; dates and resourcing require product planning.

## Phased delivery

Phase 0 establishes governance, ADRs, threat model, schemas, and UX prototypes. Phase 1 delivers identity, tenant boundaries, paper accounts, strategy registry, signal ingestion, audit trail, and dashboards. Phase 2 adds decisioning, risk policy, simulated execution, reconciliation, and analytics. Phase 3 integrates Delta Exchange in sandbox with failure drills. Phase 4 permits a tightly controlled live pilot. Phase 5 scales operations, reporting, and supported instruments only after evidence supports expansion.

## Release gates

Progression requires documented acceptance criteria, security review, risk-owner approval, test evidence, observability, runbooks, recovery testing, and explicit go/no-go decision. A live pilot additionally requires legal/compliance review and a tested kill switch.

## Definition of done

For each phase, complete the required user workflows in its target environment; publish contracts and data migrations; demonstrate tenant isolation, auditability, and accessibility; operate dashboards and alerts; pass mandatory tests; and record approvals. A phase is not complete merely because UI screens or endpoints exist. Live-pilot completion additionally requires end-to-end sandbox evidence, account reconciliation, credential rotation, incident simulation, and recovery drill evidence.

## Dependency order

Build identity, audit, configuration, and contracts before trading logic. Build strategy registry and signal intake before decisioning; decisioning before risk; risk and order state before execution; execution before analytics based on fills; and operational controls before live enablement. Challenge functionality is last and remains optional. This order prevents user-facing workflows from being built on uncontrolled execution paths.

## Future work

Add milestones, estimates, dependencies, ownership, budget, and measurable release criteria.

## Related documents

- [Product Requirements](02_PRODUCT_REQUIREMENTS.md)
- [Deployment](17_DEPLOYMENT.md)
- [Master Prompt](22_MASTER_PROMPT.md)
- [Implementation Blueprint](23_IMPLEMENTATION_BLUEPRINT.md)
