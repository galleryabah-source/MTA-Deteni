# MTA DETENI — Audit Remediation Priority

**Audit baseline:** `main` / terminal governed range `P13.260881–274880`
**Audit date:** 2026-09-17
**Mode:** Integrated application audit — architecture, domain, security, runtime, CI, reporting, QR, offline/local and deployment boundaries

## Audit conclusion

The MTA DETENI architecture is coherent and does not require a rebuild from the beginning. The current priority is **integration proof and runtime evidence**, not additional checkpoint expansion.

P13 remains OPEN because P13-EXIT-06 still requires observable successful controlled-nonprod workflow execution and its evidence artifact. Contract-level implementation and source inspection are not treated as runtime certification.

## Priority 0 — Blocking closure evidence

1. Restore and observe a successful `domain-ci` execution for the current closure candidate.
2. Require the controlled-nonprod harness and canonical evidence artifact to pass before P13 can be CLOSED.
3. Preserve accessible step/log/artifact evidence for the closure candidate; do not infer PASS from source inspection.

## Priority 1 — Runtime integrity before feature expansion

1. Verify the P9 kernel chain in executable code: authentication → authorization → validation → domain → transaction → audit → outbox.
2. Verify PostgreSQL adapter and transaction boundaries against an approved controlled-nonprod target without performing migrations or live production execution.
3. Verify idempotency and optimistic-concurrency behavior for critical mutations.
4. Verify audit writer/verifier canonical hash material, immutability, tamper detection and audit-failure behavior.
5. Verify private storage and document handling boundaries.
6. Verify observability and deterministic test harnesses.

## Priority 2 — Application/domain integration

1. Reconcile blueprint requirements against actual application modules and routes.
2. Verify detainee, placement, movement, leave, escort, document, export, emergency, reconciliation and exception workflows as one coherent application.
3. Ensure API handlers remain thin and business rules remain in application/domain services.
4. Verify RBAC/ABAC, scope, duty assignment and segregation-of-duties enforcement at the server boundary.

## Priority 3 — Document/reporting readiness

1. Verify Daily Guard Report chain: operational records → validation → mapping → template → renderer → preview → review/approval → final document → hash/audit/archive.
2. Verify document template registry, field mapping, lifecycle, SHA-256 and audit references.
3. Verify synthetic fixtures reproduce representative report/document outputs without production data.

## Priority 4 — QR and operational-device readiness

1. Verify room, detainee and temporary-leave QR identity flows remain distinct from authorization.
2. Verify camera scanning and manual fallback across supported browsers.
3. Verify canonical QR print renderer and prevent obsolete renderer paths from becoming authoritative.
4. Verify QR resolution remains behind authentication/RBAC/policy boundaries in the real application runtime.

## Priority 5 — Deployment and continuity resilience

1. Verify Cloudflare online runtime through an approved controlled non-production target.
2. Verify local/offline runtime adapter and LAN access design on multiple devices.
3. Verify synchronization/reconciliation boundaries between local and cloud runtimes after reconnect.
4. Verify backup/restore and recovery procedures before any production authorization.

## Priority 6 — Hygiene and documentation

1. Keep `PROJECT_STATUS.md` authoritative.
2. Mark stale planning/status documents clearly as historical.
3. Keep changelog complete and append-only in practice.
4. Keep one canonical contract/renderer/runtime path where duplicate compatibility surfaces exist.
5. Do not manufacture numbered P13 checkpoints merely to increase progress counts.

## Explicit non-goals

- No schema migration.
- No live PostgreSQL execution outside an explicitly approved controlled-nonprod target.
- No production credentials/access.
- No AI activation.
- No real detainee data, production PII, health records or WhatsApp exports.
- No external transport or durable publication.

## Completion principle

A remediation is complete only when implementation, regression coverage, integration evidence, observability and documentation agree. P13 remains OPEN until all eight P13 exit criteria have observable evidence.
