# MTA DETENI — Project Status

**Foundation:** v1.60+
**Current Track:** P13.5809–5880 observable execution + evidence acceptance
**Branch:** `main`
**Latest implementation commit:** `68c9f6c7425fd0d0de40a7d5e05f1331195e80eb`

## Latest progress

- P13.5809–5822 — deterministic architecture/governance contract gate;
- P13.5809–5880 — observable execution and evidence acceptance contract;
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

**P13.5822 — STATIC CONTRACT GATE IMPLEMENTED / OBSERVATION PENDING**

A deterministic contract gate now validates the package/test boundaries, controlled CI environment, evidence publication, governance locks, canonical `HEAD_RUDENIM` vocabulary and non-false certification state. It writes `artifacts/mta-evidence/contract-gate.json` and is executed before dependency installation/runtime checks.

The repository still cannot claim CI PASS because the latest GitHub Actions observation failed with a completed job that exposed no usable step telemetry. This remains an infrastructure/runner observation blocker, not an application PASS or FAIL.

## Next gate

**P13.5823–5880 — obtain observable CI telemetry, validate execution/evidence identity, then begin controlled application-surface verification.**

**Following:** P13.5881–5960 — runtime/browser/RBAC synthetic journey and LAN/offline continuity harness design.

No production deployment, live operational integration, or schema migration is implied.
