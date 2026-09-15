# MTA DETENI — Project Status

**Foundation:** v1.60+
**Current Track:** P13.5827–5880 domain-surface hardening / observation pending
**Branch:** `main`
**Latest implementation commit:** `5ffe64274cf0ba6932053c4eefafa2551a076579`

## Latest progress

- P13.5827 — canonical synthetic temporary-exit approval actor aligned to `HEAD_RUDENIM`;
- P13.5827–5840 — added deterministic movement, placement and authorization/SoD synthetic contract tests;
- P13.5824–5826 — deterministic temporary-exit synthetic journey: complete happy path, invalid skip/reversal rejection and terminal-state protection;
- P13.5809–5822 — deterministic architecture/governance contract gate and observable execution/evidence acceptance contract;
- P13.5801–5808 — deterministic non-production execution harness, test compilation boundary and controlled evidence upload;
- P13.5681–5720 — canonical governance vocabulary;
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

**P13.5827–5840 — IMPLEMENTED / OBSERVATION PENDING**

The repository now contains dependency-light synthetic checks for movement append-only behavior and headcount unknown-state handling, placement exclusivity/versioning, and canonical `HEAD_RUDENIM` approval with separation of duties. These remain uncertified until CI exposes usable execution telemetry.

Latest known CI behavior remains an infrastructure/runner observation blocker: completed failure with zero reported steps. No application PASS or application test FAIL is inferred from that condition.

## Next gate

**P13.5841–5880 — reporting snapshot, QR contextual semantics, audit/evidence binding and integrated synthetic domain journey.**

**Following:** P13.5881–5960 — runtime/browser/RBAC synthetic journey and LAN/offline continuity harness design.

No production deployment, live operational integration, AI activation, or schema migration is implied.
