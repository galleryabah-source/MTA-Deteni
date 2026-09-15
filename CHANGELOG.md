# Changelog

## P13.6201–6240 — Reporting Integrity & End-to-End Continuity Certification

- Hardened reporting snapshot immutability by freezing projected rows as well as the row collection.
- Added canonical reporting snapshot verification for deterministic export/rendering inputs.
- Added reconnect reporting integrity guard binding snapshot `sourceRevision`, evidence identity, decision, queue states, payload hash, idempotency key and recording timestamp.
- Added complete synthetic journey regression: offline command → reconnect transition → synced state → reconnect evidence → reporting projection → canonical snapshot verification.
- Added negative-path tamper coverage for source revision and evidence material, plus row-level immutability.
- Preserved Migration Freeze, AI OFF, synthetic-only repository data, production authorization FALSE and live PostgreSQL block.
- No schema migration introduced.

## P13.6161–6200 — Reconnect Reporting Projection

- Added framework-neutral reporting projection consuming immutable reconnect evidence.
- Preserved command identity, aggregate identity, reconciliation decision and queue-state transition in reporting rows.
- Bound reporting snapshot `sourceRevision` to the reconnect `commandId`.
- Added deterministic regression for APPLY, SKIP_DUPLICATE and REVIEW_CONFLICT reporting semantics.
- Kept projection synthetic-only with no production persistence, database execution or schema migration.

## P13.6043–6120 — Reconnect State and Evidence Hardening

- Added explicit reconnect transition contract for `APPLY`, `SKIP_DUPLICATE` and `REVIEW_CONFLICT` decisions.
- Enforced deterministic queue transitions: `PENDING/SYNCING → SYNCED` for apply/duplicate and `PENDING/SYNCING → CONFLICT` for revision mismatch.
- Bound reconnect transitions to stable `commandId` and current queue state; invalid identity or source state fails closed.
- Added synthetic regression coverage for successful reconnect, duplicate suppression, revision conflict and transition guards.
- Preserved the existing authorization/idempotency/evidence application chain; no runtime adapter bypass was introduced.
- Preserved Migration Freeze, AI OFF, synthetic-only repository data, production authorization FALSE and live PostgreSQL block.
- No schema migration introduced.

## P13.6041–6080 — Stable Runtime Adapter Identity

- Strengthened persistent queue replacement around stable domain identity (`commandId`) rather than object reference.
- Added deterministic regression for equivalent-object replacement and fail-closed unknown identity.
- Preserved framework-neutral synthetic adapter boundary; no durable production persistence was introduced.
- Preserved Migration Freeze, AI OFF, synthetic-only repository data, production authorization FALSE and live PostgreSQL block.
- No schema migration introduced.
