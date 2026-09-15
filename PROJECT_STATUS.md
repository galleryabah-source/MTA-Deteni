# MTA DETENI — Project Status

**Foundation:** v1.60+
**Current Track:** P13.5961–6040 runtime implementation boundary / observation pending
**Branch:** `main`
**Latest implementation checkpoint:** P13.5961–5962

## Latest progress

- P13.5961 — added browser transport boundary requiring request identity, authenticated LAN device identity and idempotency for mutations;
- P13.5962 — added versioned synthetic backup manifest identity and validation;
- P13.5921–5960 — responsive application-surface invariants, role-aware navigation, multi-device LAN identity, local-PC service boundary, synthetic backup/restore identity and continuity evidence binding;
- P13.5901–5920 — runtime capability contract for CLOUD, LAN and LOCAL modes;
- P13.5881–5900 — offline command queue, idempotency-aware reconnect reconciliation and conflict-review contract;
- P13.5841–5880 — contextual QR semantics, immutable reporting snapshot and integrated cross-domain synthetic journey.

## Runtime implementation boundary

The next implementation layer is intentionally adapter-based. `BrowserTransportRequest` defines the request identity and idempotency boundary without binding the application to a specific HTTP framework. `PersistentQueueAdapter<T>` defines the storage seam without assuming IndexedDB or another browser store. `BackupManifest` defines the recovery identity seam without implementing real backup transfer or restore.

This preserves the architecture: UI/API Command → Authorization → Domain Workflow → Immutable Evidence → Reconciliation → Projection → Reporting. Runtime adapters must not bypass authorization, idempotency or audit/evidence controls.

## Governance locks

- Migration Freeze: **TRUE**;
- AI: **OFF**;
- Repository data: **SYNTHETIC ONLY**;
- Production access: **NOT AUTHORIZED**;
- Live PostgreSQL execution: **BLOCKED until explicit governance clearance and an approved non-production target**;
- Real detainee data, credentials, health records, WhatsApp exports and production PII: **PROHIBITED**;
- No schema migration before approved data model, security controls, reconciliation and governance gate.

## Current certification state

**P13.5961–6040 — IMPLEMENTED CONTRACTS / OBSERVATION PENDING**

GitHub Actions remains an observation blocker when job-step telemetry is unavailable. Repository commits are therefore not represented as runtime PASS. All current tests are synthetic contracts only.

## Next gate

**P13.5963–6040 — adapter-level synthetic runtime journey:** persistent queue adapter behavior, LAN session binding, local-PC service adapter fail-closed behavior, backup manifest chain and end-to-end offline → reconnect → reconciliation → reporting evidence journey. No production deployment or live database.
