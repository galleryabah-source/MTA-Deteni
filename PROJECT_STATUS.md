# MTA DETENI — Project Status

**Foundation:** v1.60+
**Current Track:** P13.5963–6040 adapter-level synthetic runtime journey / observation pending
**Branch:** `main`
**Latest implementation checkpoint:** P13.5963–5966

## Latest progress

- P13.5963 — added persistent queue adapter seam and deterministic offline command persistence test;
- P13.5964 — added LAN session binding across device, installation and network scope;
- P13.5965 — hardened browser mutation transport and local-PC adapter fail-closed boundaries;
- P13.5966 — added identity-linked versioned synthetic backup manifest chain;
- P13.5961–5962 — browser transport request boundary and synthetic backup manifest identity;
- P13.5921–5960 — responsive application-surface invariants, role-aware navigation, multi-device LAN identity, local-PC service boundary, backup/restore identity and continuity evidence binding;
- P13.5901–5920 — runtime capability contract for CLOUD, LAN and LOCAL modes;
- P13.5881–5900 — offline command queue, idempotency-aware reconnect reconciliation and conflict-review contract;
- P13.5841–5880 — contextual QR semantics, immutable reporting snapshot and integrated cross-domain synthetic journey.

## Runtime implementation boundary

Runtime adapters remain framework-neutral. Browser transport requires request identity, authenticated LAN device identity and idempotency for mutations. Persistent queue storage is abstracted behind an adapter seam; the current in-memory implementation is synthetic verification only and is not a production persistence claim. LAN sessions are bound to device, installation and network scope. Local-PC boundaries fail closed against internet exposure. Backup manifests are versioned, synthetic-only and identity-linked.

The application chain remains: UI/API Command → Authorization → Domain Workflow → Immutable Evidence → Reconciliation → Projection → Reporting. Runtime adapters must not bypass authorization, idempotency or audit/evidence controls.

## Governance locks

- Migration Freeze: **TRUE**;
- AI: **OFF**;
- Repository data: **SYNTHETIC ONLY**;
- Production access: **NOT AUTHORIZED**;
- Live PostgreSQL execution: **BLOCKED until explicit governance clearance and an approved non-production target**;
- Real detainee data, credentials, health records, WhatsApp exports and production PII: **PROHIBITED**;
- No schema migration before approved data model, security controls, reconciliation and governance gate.

## Current certification state

**P13.5963–6040 — IMPLEMENTED CONTRACTS / OBSERVATION PENDING**

The adapter contracts and synthetic tests are committed. GitHub Actions currently completes with `failure` but exposes no usable job-step telemetry (`steps: null`) and no logs/artifacts for the latest run. This is classified as an infrastructure/observation blocker, not an application test failure. No runtime PASS is inferred.

## Next gate

**P13.5967–6040 — integrated synthetic continuity journey:** connect persistent queue, LAN session, local-PC boundary, backup chain, reconnect reconciliation and continuity evidence into one deterministic application-level journey. No production deployment, live database, AI activation or schema migration.
