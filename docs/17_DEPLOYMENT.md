# Deployment and Operations

## Table of Contents

- [Purpose](#purpose)
- [Scope](#scope)
- [Environment strategy](#environment-strategy)
- [Release and operations](#release-and-operations)
- [Environment controls](#environment-controls)
- [Incident and recovery policy](#incident-and-recovery-policy)
- [Required cloud components](#required-cloud-components)
- [Future work](#future-work)
- [Related documents](#related-documents)

## Purpose

Define safe delivery, environment separation, and production-operability standards.

## Scope

Applies from local development through production and disaster recovery.

## Environment strategy

Maintain isolated local, development, test, staging, paper-trading, and production environments. Production secrets, accounts, network paths, and data are never reused elsewhere. Infrastructure is declarative, reviewed, traceable, and reproducible. Paper and live exchange modes are isolated by configuration and credentials.

## Release and operations

Use automated build, test, security, and migration gates; progressive delivery; monitored rollback; and change records for execution-affecting releases. Maintain health checks, dashboards, alert ownership, on-call runbooks, backup/restore drills, dependency status monitoring, and tested kill-switch procedures. No release may bypass risk or audit controls.

## Environment controls

Development uses synthetic data and mock integrations. Test uses isolated seeded data. Staging connects only to sandbox/test dependencies. Paper production uses production-grade controls but paper credentials. Production live has separate cloud accounts/projects, secrets, network rules, and change approval. CI deploy identities are environment-scoped and cannot read production secrets. Configuration is versioned, validated at startup, and contains no credentials; secret references are injected at runtime.

## Incident and recovery policy

Severity 1 includes suspected unauthorized execution, account compromise, global execution outage, or irreconcilable order state; it triggers immediate risk halt and incident lead assignment. Severity 2 covers material degradation with a safe workaround. Runbooks must cover dependency outage, queue backlog, database restore, credential rotation, venue mismatch, webhook abuse, and kill-switch operation. Define production targets before launch: RPO no greater than 15 minutes for transactional data, RTO no greater than 4 hours, and documented exceptions for external venue recovery.

## Required cloud components

Production requires managed DNS and certificate lifecycle, CDN/static asset delivery, WAF and DDoS protection, load balancer/API ingress, private network segments, container orchestration and autoscaling, container artifact registry, PostgreSQL with backups and point-in-time recovery, a durable message broker with dead-letter queues, Redis, object storage, KMS, managed secrets, IAM/workload identity, centralized logs/metrics/traces, alert routing, configuration management, CI/CD runners, vulnerability scanning, and a backup vault. Production database, broker, secrets, and administrative access must not be publicly reachable.

## Future work

Set SLOs, RTO/RPO, deployment topology, incident severity policy, and change-approval workflow.

## Related documents

- [Architecture](03_ARCHITECTURE.md)
- [Security](18_SECURITY.md)
- [Testing](19_TESTING.md)
- [Implementation Blueprint](23_IMPLEMENTATION_BLUEPRINT.md)
