# MTA DETENI — Project Status

**Foundation:** v1.60+
**Current Track:** P13.5841–5880 reporting/QR/integrated synthetic hardening / observation pending
**Branch:** `main`
**Latest implementation commit:** `f63aa044455838e8bc84d6c73db31fc7e4f1aa20`

## Latest progress

- P13.5841 — added contextual QR domain contract separating detainee/block display from temporary-exit and deportation scan operations;
- P13.5841 — added immutable, deterministic reporting snapshot contract;
- P13.5841–5880 — added synthetic QR/reporting tests and integrated cross-domain journey covering placement, movement, temporary exit, HEAD_RUDENIM approval, SUBBAG TU documentation, escort, return and reporting snapshot;
- P13.5827–5840 — canonical actor cleanup plus deterministic movement, placement, authorization and SoD synthetic contract tests;
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

**P13.5841–5880 — IMPLEMENTED / OBSERVATION PENDING**

The repository now has dependency-light synthetic coverage for movement, placement, authorization/SoD, contextual QR semantics, deterministic reporting snapshots and an integrated temporary-exit journey across the intended domain ownership boundaries. Certification is still blocked only by the unresolved CI observation condition; no application PASS or application test FAIL is inferred from the runner telemetry gap.

Latest observed GitHub Actions runs continue to complete as `failure` with `steps: null`, so the result is classified as an infrastructure/runner observation blocker rather than an application failure.

## Next gate

**P13.5881–5960 — runtime/browser/RBAC synthetic journey + LAN/offline continuity harness design.**

Targets: responsive application-surface verification, role-aware navigation, synthetic multi-device LAN access, offline write queue semantics, reconnect reconciliation, local backup/restore, conflict-safe synchronization, and evidence binding. No production deployment, live PostgreSQL, AI activation or schema migration is implied.
