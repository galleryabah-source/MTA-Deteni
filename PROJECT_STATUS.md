# MTA DETENI — Project Status

**Foundation:** v1.134+
**Current Track:** P1 runtime integrity remediation / P9 kernel implementation / P13 closure evidence recovery
**Branch:** `main`
**Latest implementation checkpoint:** P9.8 governed outbox contract; P13 governed boundary remains P13.274880

## P9 kernel implementation

- P9.0 repository audit and P9.1 runtime skeleton remain established by the project baseline.
- P9.2–P9.5 security-kernel contracts remain established for configuration, authentication, authorization and audit.
- P9.6 database-adapter contract is implemented with typed query/result and transaction boundaries, lifecycle state, configuration validation and explicit migration-role blocking.
- P9.7 transaction + idempotency boundary contract is implemented with deterministic EXECUTE / REPLAY / CONFLICT decisions and commit-after-success / rollback-on-failure semantics.
- **P9.8 is now implemented as a governed outbox contract**, requiring validated pending events with explicit event/aggregate identity, payload fingerprint, timestamp and attempt counter; append remains behind a dedicated store boundary.
- P9.6–P9.8 remain deliberately runtime-unbound. They do not connect to PostgreSQL, execute SQL, run migrations or alter schema.
- Actual PostgreSQL binding requires a separately authorized controlled non-production target and governance clearance.

## P1 runtime integrity remediation

- Critical mutation path exists as an application orchestration path: authorization → idempotency → transaction → domain mutation → audit → outbox.
- Failure-path regression models transactional rollback for domain, audit and outbox failures in the synthetic harness.
- Optimistic concurrency execution contract provides deterministic ACCEPT/STALE_VERSION semantics.
- P9.7 provides an explicit idempotency-aware transaction boundary.
- P9.8 provides a validated pending outbox boundary so downstream publication cannot bypass the transactional evidence path.
- Further executable integration verification remains required before P1 can be certified complete.

## P13 closure audit

- P13 exit criteria remain explicitly defined in `P13_EXIT_CRITERIA.md`.
- P13.260881–274880 adds 100 integrity-certification-evidence continuation checkpoints as a governed review-only contract layer.
- P13-EXIT-01, 02, 03, 04, 05 and 08 retain repository evidence.
- P13-EXIT-06 (observable GitHub Actions execution evidence for the closure candidate) remains pending.
- P13-EXIT-07 (synchronized documentation) is maintained by this status and changelog.
- No additional numbered checkpoints are manufactured solely to increase counts.

## Governance locks

- Migration Freeze: **TRUE**
- AI: **OFF**
- Repository data: **SYNTHETIC ONLY**
- Production access: **NOT AUTHORIZED**
- Live PostgreSQL execution: **BLOCKED until explicit governance clearance and approved non-production target**
- Real detainee data, credentials, health records, WhatsApp exports and production PII: **PROHIBITED**
- No schema migration before approved data model, security controls, reconciliation and governance gate.

## Current certification state

**P13.260881–274880 — IMPLEMENTED CONTRACTS / OBSERVATION PENDING**
**P1 Runtime Integrity — REMEDIATION IN PROGRESS**
**P9.6 Database Adapter — CONTRACT IMPLEMENTED / RUNTIME BINDING BLOCKED**
**P9.7 Transaction + Idempotency — CONTRACT IMPLEMENTED / RUNTIME BINDING BLOCKED**
**P9.8 Outbox — CONTRACT IMPLEMENTED / RUNTIME BINDING BLOCKED**

## Closure rule

P13 is **NOT CLOSED** until all eight P13 exit criteria have observable evidence, including successful controlled-nonprod workflow execution and evidence artifacts for the closure candidate.

## Documentation integrity

`PROJECT_STATUS_NEXT.md` is retained as historical/stale planning context and must not override this current status.
