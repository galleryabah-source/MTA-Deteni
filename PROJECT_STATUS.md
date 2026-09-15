# MTA DETENI — Project Status

**Foundation:** v1.60+
**Current Track:** P13.5921–5960 browser/RBAC/LAN runtime contract expansion / observation pending
**Branch:** `main`
**Latest implementation checkpoint:** P13.5921–5960

## Latest progress

- P13.5921–5960 — added responsive application-surface invariants for desktop/tablet/smartphone, role-aware deny-by-default navigation, multi-device LAN identity, local-PC service boundary, synthetic backup/restore identity and continuity evidence binding;
- P13.5901–5920 — added deterministic runtime capability contract for CLOUD, LAN and LOCAL modes, including offline-write and local-backup safety invariants;
- P13.5881–5900 — added deterministic offline command queue, idempotency-aware reconnect reconciliation and conflict-review contract;
- P13.5841–5880 — contextual QR semantics, immutable reporting snapshot and integrated cross-domain synthetic journey;
- P13.5827–5840 — canonical actor cleanup plus deterministic movement, placement, authorization and SoD synthetic contract tests.

## Integrated application model

RAP owns registration, administration and reporting; PERKES owns health records and health workflows; KAMTIB owns placement, movement, headcount, temporary exit, escort and operational QR; SUBBAG TU owns escort-document administration; HEAD RUDENIM has oversight, read-only operational visibility and authority for petunjuk, arahan, rekomendasi and disposisi without direct operational editing.

The application chain remains:

`UI/API Command → Authorization Policy → Canonical Operational Envelope → Domain Aggregate → Transaction Context → Idempotency → Domain Workflow → Immutable Timeline/Audit → Operational Evidence → Reconciliation → Outbox → Projection Checkpoint → Read Model → QR/Movement/Temporary Exit → Reporting Snapshot → Review/Approval → Generated Artifact`

## Runtime continuity model

`CLOUD` is online-only; `LAN` supports multi-device local network continuity plus local backup; `LOCAL` supports device-local/offline writes and local backup. Offline commands carry command identity, aggregate identity, payload hash and idempotency key. Reconnect must skip duplicates, apply only when aggregate revision matches, and route revision conflicts to review rather than silently overwrite. Runtime capability claims fail closed when contradictory.

P13.5921–5960 now binds the application surface to responsive invariants and role-aware navigation, while LAN identity and local-PC service boundaries remain explicit contracts rather than claims of a running local server. Backup/restore identity and continuity evidence are synthetic metadata contracts; cryptographic artifact storage and real runtime observation remain later gates.

## Governance locks

- Migration Freeze: **TRUE**;
- AI: **OFF**;
- Repository data: **SYNTHETIC ONLY**;
- Production access: **NOT AUTHORIZED**;
- Live PostgreSQL execution: **BLOCKED until explicit governance clearance and an approved non-production target**;
- Real detainee data, credentials, health records, WhatsApp exports and production PII: **PROHIBITED**;
- No schema migration before approved data model, security controls, reconciliation and governance gate.

## Current certification state

**P13.5921–5960 — IMPLEMENTED CONTRACTS / OBSERVATION PENDING**

The new contracts and synthetic tests have been committed, but they are not certified by execution while GitHub Actions exposes no usable job-step telemetry. No application PASS or application test FAIL is inferred from that infrastructure observation gap.

## Next gate

**P13.5961–6040 — runtime implementation boundary:** local-PC service adapter, browser transport boundary, persistent offline queue adapter, LAN discovery/session contract, backup manifest/recovery protocol, and end-to-end synthetic runtime journey. Implementation remains non-production and must preserve Migration Freeze, AI OFF and production access block.
