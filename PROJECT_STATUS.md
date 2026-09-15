# MTA DETENI — Project Status

**Foundation:** v1.60+
**Current Track:** P13.5881–5960 runtime/LAN/offline continuity design / observation pending
**Branch:** `main`
**Latest implementation checkpoint:** P13.5901–5920

## Latest progress

- P13.5901–5920 — added deterministic runtime capability contract for CLOUD, LAN and LOCAL modes across desktop/tablet/smartphone, including offline-write and local-backup safety invariants;
- P13.5881–5900 — added deterministic offline command queue, idempotency-aware reconnect reconciliation and conflict-review contract;
- P13.5841–5880 — contextual QR semantics, immutable reporting snapshot and integrated cross-domain synthetic journey;
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

## Runtime continuity model

`CLOUD` is online-only; `LAN` supports multi-device local network continuity plus local backup; `LOCAL` supports device-local/offline writes and local backup. Offline commands carry command identity, aggregate identity, payload hash and idempotency key. Reconnect must skip duplicates, apply only when aggregate revision matches, and route revision conflicts to review rather than silently overwrite. Runtime capability claims fail closed when contradictory.

The contract is intentionally implementation-neutral: it does not yet claim a running local PC server, browser UI, IndexedDB queue, synchronization service or backup engine. Those require later runtime implementation and observation.

## Governance locks

- Migration Freeze: **TRUE**;
- AI: **OFF**;
- Repository data: **SYNTHETIC ONLY**;
- Production access: **NOT AUTHORIZED**;
- Live PostgreSQL execution: **BLOCKED until explicit governance clearance and an approved non-production target**;
- Real detainee data, credentials, health records, WhatsApp exports and production PII: **PROHIBITED**;
- No schema migration before approved data model, security controls, reconciliation and governance gate.

## Current certification state

**P13.5881–5960 — IMPLEMENTED CONTRACTS / OBSERVATION PENDING**

Synthetic contracts now cover offline queue/reconnect conflict semantics and runtime mode capability safety. They are not certified by execution because GitHub Actions continues to terminate with `failure` while exposing no usable job-step telemetry (`steps: null`). No application PASS or application test FAIL is inferred from that infrastructure condition.

## Next gate

**P13.5921–5960 — browser/RBAC/LAN runtime contract expansion:** responsive application-surface invariants, role-aware navigation, multi-device LAN identity, local-PC service boundary, local backup/restore identity and evidence binding. Keep all work synthetic and non-production.

**Following:** controlled runtime observation once GitHub runner telemetry is available.
