# Changelog

## P13.8161–8280 — Recovery Journey Certification

- Added a deterministic synthetic recovery journey spanning pre-commit rejection, post-commit infrastructure recovery, and offline reconnect conflict review.
- Added recovery evidence binding to lifecycle command, event, correlation, aggregate and version identities.
- Proved pre-commit failure paths produce zero mutation, audit and outbox effects at the contract level.
- Proved committed outbox/projection recovery performs one logical mutation with `RETRY → SKIP_DUPLICATE` retry evidence.
- Added a recovery certification boundary enforcing mutation/audit/outbox cardinality and canonical retry sequencing.
- Added synthetic regression coverage for zero-effect rejection, post-commit deduplication, reconnect conflict review and duplicate-effect rejection.
- No cross-system atomic rollback assumption was introduced.
- No concrete database driver, schema migration, AI activation, production persistence, or live PostgreSQL execution.

## P13.7921–8040 — Lifecycle Recovery & Continuity Integration

- Separated lifecycle `requestHash` from `commandId`; command identity is no longer silently reused as request content identity.
- Added synthetic recovery evidence binding failure class, reason code, terminal state, recoverability, command/event/correlation/aggregate identity and expected/resulting versions.
- Added fail-closed version semantics: pre-commit failure evidence cannot advance the aggregate; committed recovery evidence must advance exactly one version.
- Added idempotent retry decisions for committed outbox/projection recovery with explicit duplicate-skip and review-required outcomes.
- Bound offline reconnect decisions to reconciliation outcomes so `REVIEW_CONFLICT` cannot be accepted without a reconciliation `CONFLICT` state.
- Hardened lifecycle certification to exactly five canonical ordered steps and explicit replay/version semantics.
- Added synthetic regression coverage for recovery evidence, retry deduplication, reconnect/reconciliation binding and explicit request-hash validation.
- No concrete database driver, schema migration, AI activation, production persistence, or live PostgreSQL execution.

## P13.7801–7920 — Failure Injection & Recovery Matrix

- Added a deterministic synthetic failure/recovery matrix covering authorization denial, stale version, idempotency conflict, repository conflict, outbox failure, reporting refresh failure, and offline reconnect conflict.
- Added explicit terminal states, stable reason codes and recoverability classifications for each governed failure.
- Pre-commit failures are fail-closed and are not treated as blindly retryable.
- Post-commit infrastructure failures are explicitly retryable without representing them as distributed rollback.
- Added an explicit compensation boundary contract so compensation is never inferred from a generic failure or presented as atomic cross-system rollback.
- Added canonical recovery-case validation and deterministic fingerprinting for regression evidence.
- Added synthetic regression coverage for all failure classes, retry safety, tamper detection and compensation-boundary semantics.
- No concrete database driver, schema migration, AI activation, production persistence, or live PostgreSQL execution.

## P13.7401–7440 — Reconciliation & Application Service Seams

- Added deterministic reconciliation across repository entity state, offline queue state and reporting projection source revision.
- Added explicit reconciliation outcomes: `CONSISTENT`, `REPLAY_REQUIRED`, `CONFLICT`, and `MISSING_PROJECTION`, with fail-closed safety for unresolved states.
- Added a unified application mutation service seam for detainee registration, placement, movement and temporary-exit advancement.
- Application service authorization is evaluated before entering the critical mutation kernel.
- All mutation paths route through the existing transaction, idempotency, audit and outbox integration boundary; no direct persistence implementation was added.
- Added synthetic regression coverage for deterministic reconciliation, replay behavior, source conflicts, and prevention of duplicate audit/outbox effects.
- No concrete database driver, schema migration, AI activation, production persistence, or live PostgreSQL execution.

## P13.7121–7200 — Critical Mutation Integration Seam

- Added an application integration seam composing idempotency, transaction execution, domain mutation, mandatory audit and transactional outbox publication within the transaction runner boundary.
- Added fail-closed replay behavior for completed idempotency keys and explicit conflict behavior for request-hash reuse.
- Added synthetic regression coverage for commit, replay and conflict paths.
- No concrete database driver or production persistence was introduced.
