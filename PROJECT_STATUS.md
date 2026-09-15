# MTA DETENI — Project Status

**Foundation:** v1.60+
**Current Track:** P13.5801–5808 controlled execution harness hardening
**Branch:** `main`
**Latest implementation commit:** `91717d842de1a05f2584b41d75663a045f629149`

## Latest progress

- P13.5801–5805 — deterministic non-production execution harness for Node/npm, production typecheck, regression and TypeScript domain tests;
- P13.5806 — explicit TypeScript test compilation boundary;
- P13.5807 — explicit `typecheck:test` package command;
- P13.5808 — CI hardened with controlled execution evidence and artifact upload;
- P13.5681–5720 — canonical `HEAD_RUDENIM` governance vocabulary;
- P13.5721–5760 — DR evidence binding;
- P13.5761–5800 — report rendering evidence gate.

## Integrated application model

RAP owns registration, administration and reporting; PERKES owns health records and health workflows; KAMTIB owns placement, movement, headcount, temporary exit, escort and operational QR; SUBBAG TU owns escort-document administration; HEAD RUDENIM has oversight, read-only operational visibility and authority for petunjuk, arahan, rekomendasi and disposisi without direct operational editing.

The application chain remains:

`UI/API Command → Authorization Policy → Canonical Operational Envelope → Domain Aggregate → Transaction Context → Idempotency → Domain Workflow → Immutable Timeline/Audit → Operational Evidence → Reconciliation → Outbox → Projection Checkpoint → Read Model → QR/Movement/Temporary Exit → Reporting Snapshot → Review/Approval → Generated Artifact`

## Governance locks

- Migration Freeze: **TRUE**;
- AI: **OFF**;
- Repository data: **SYNTHETIC ONLY**;
- Production access: **NOT AUTHORIZED**;
- Live PostgreSQL execution: **BLOCKED until explicit governance clearance and an approved non-production target**;
- Real detainee data, credentials, health records, WhatsApp exports and production PII: **PROHIBITED**;
- No schema migration before approved data model, security controls, reconciliation and governance gate.

## Current certification state

**P13.5808 — EXECUTION HARNESS READY / OBSERVATION PENDING**

The repository now has a reproducible CI execution path that captures commit SHA, run identity, environment, timestamps, control IDs, exit codes and command output into an evidence artifact. This does not itself certify PASS; certification requires successful observable execution.

The previous CI run failed with zero reported job steps. A controlled rerun was attempted and also did not yield usable step telemetry. This is treated as infrastructure/runner observation failure, not as application PASS or FAIL.

## Next gate

**P13.5809–5880 — first observable CI execution, evidence validation and controlled application-surface verification.**

No production deployment, live operational integration, or schema migration is implied.
