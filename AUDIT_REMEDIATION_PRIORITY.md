# MTA DETENI — Audit Remediation Priority

**Baseline:** `main` / P13.260880

## Priority 0 — Blocking closure evidence

1. Restore observable GitHub Actions execution evidence for the P13 closure candidate.
2. Require the controlled-nonprod harness and evidence artifact to be successful before P13 can be CLOSED.
3. Diagnose the current `domain-ci` failure from a workflow run with accessible step/log evidence; do not infer PASS from source inspection.

## Priority 1 — Runtime integrity before feature expansion

1. Verify the P9 kernel chain in executable code: authentication → authorization → validation → domain → transaction → audit → outbox.
2. Verify PostgreSQL adapter and transaction boundaries without performing migrations or live production execution.
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

## Priority 4 — Deployment resilience

1. Verify Cloudflare online deployment path.
2. Verify local/offline runtime adapter and LAN access design.
3. Verify synchronization/reconciliation boundaries between local and cloud runtimes.
4. Verify backup/restore and recovery procedures before any production authorization.

## Priority 5 — Hygiene and documentation

1. Keep `PROJECT_STATUS.md` authoritative.
2. Mark stale planning/status documents clearly as historical.
3. Keep changelog complete and append-only in practice.
4. Remove or isolate redundant contract inflation only where doing so does not weaken traceability.

## Explicit non-goals

- No schema migration.
- No live PostgreSQL execution.
- No production credentials/access.
- No AI activation.
- No real detainee data, production PII, health records or WhatsApp exports.
- No external transport or durable publication.

## Completion principle

A remediation is complete only when implementation, regression coverage, integration evidence, observability and documentation agree. P13 remains OPEN until all eight P13 exit criteria have observable evidence.
