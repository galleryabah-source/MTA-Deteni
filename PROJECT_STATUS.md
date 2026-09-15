# MTA DETENI — Project Status

**Foundation:** v1.60+
**Current Track:** P13.6041–6080 runtime adapter identity hardening / observation pending
**Branch:** `main`
**Latest implementation checkpoint:** P13.6041

## Latest progress

- P13.6041 — strengthened queue replacement around stable command identity rather than object reference;
- P13.6042 — added regression proving an equivalent command object can replace a queued command by `commandId`, while unknown identity fails closed;
- P13.5967–6040 — composed offline command → persistent queue → LAN session → local-PC boundary → backup chain → reconnect reconciliation → reporting snapshot → continuity evidence;
- P13.5963–5966 — persistent queue seam, LAN session binding, browser/local-PC boundary hardening and synthetic backup manifest chain;
- P13.5841–5880 — contextual QR semantics, immutable reporting snapshot and integrated cross-domain synthetic journey.

## Runtime continuity integrity

Queue identity is now explicit at the adapter seam: command replacement can be addressed by stable domain identity (`commandId`) without relying on object identity. This is still a framework-neutral synthetic adapter; it does not claim durable browser/SQLite/PostgreSQL persistence.

The application chain remains: UI/API Command → Authorization → Domain Workflow → Immutable Evidence → Reconciliation → Projection → Reporting. Runtime adapters do not bypass authorization, idempotency or audit/evidence controls.

## Governance locks

- Migration Freeze: **TRUE**;
- AI: **OFF**;
- Repository data: **SYNTHETIC ONLY**;
- Production access: **NOT AUTHORIZED**;
- Live PostgreSQL execution: **BLOCKED until explicit governance clearance and an approved non-production target**;
- Real detainee data, credentials, health records, WhatsApp exports and production PII: **PROHIBITED**;
- No schema migration before approved data model, security controls, reconciliation and governance gate.

## Current certification state

**P13.6041–6080 — IMPLEMENTED CONTRACTS / OBSERVATION PENDING**

The stable queue identity contract and regression are committed. GitHub Actions remains subject to the existing observation blocker when job-step telemetry/logs/artifacts are unavailable. No runtime PASS is inferred until controlled CI observation is available.

## Next gate

**P13.6043–6120 — reconnect state/evidence hardening:** explicitly model queue state transitions during reconnect, bind APPLY/SKIP_DUPLICATE/REVIEW_CONFLICT outcomes to continuity evidence, and preserve immutable reporting semantics. No production persistence, schema migration, AI or live database execution.
