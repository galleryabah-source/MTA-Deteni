# MTA DETENI — Integrated Acceptance Gate v1.0

**Date:** 2026-09-21  
**Baseline:** `main`  
**Purpose:** turn the current architecture and contract baseline into a single executable acceptance path without bypassing governance locks.

## Acceptance sequence

1. P9.7 transaction/idempotency executable regression.
2. Synthetic domain journey composition.
3. Offline/LAN continuity and reconnect/reconciliation.
4. Daily Guard Report + QR + device/browser acceptance.
5. Controlled-nonprod PostgreSQL adapter execution only after explicit governance clearance.
6. Cloudflare controlled-nonprod verification.
7. Backup/restore and disaster-recovery evidence.
8. Final production-readiness review.

## Non-negotiable invariants

- Migration execution is not performed by this gate.
- No production credentials are introduced.
- No real detainee/PII/health/WhatsApp data is used.
- AI remains disabled.
- External transport and durable publication remain disabled unless separately authorized.
- QR identifies a subject/location; QR scanning does not itself authorize an operation.
- Critical mutations preserve one execution context across authorization, idempotency, transaction, audit and outbox.
- Replay is deterministic; request-hash drift is a conflict.
- Evidence must be observable from CI/runtime artifacts, not inferred from summary booleans.

## Exit evidence

A gate is PASS only when implementation, test coverage, observable execution evidence and documentation agree. A contract-only PASS is not a runtime PASS.

## Current open gates

- Integrated synthetic end-to-end runtime evidence (composition contract is now implemented; runtime execution evidence remains open).
- Offline/LAN runtime and reconnect/reconciliation validation.
- Daily Guard Report + QR + device/browser acceptance on the current revision.
- Controlled-nonprod PostgreSQL execution.
- Cloudflare controlled-nonprod validation.
- Backup/restore and disaster recovery.

## Production activation reconciliation

The repository contains production foundation migration/auth/RBAC artifacts and recent commits describe production activation work. Presence of migration files or a commit message is not treated as independent proof that a live target was executed or is currently healthy. Live-target evidence remains a separate governance gate.
