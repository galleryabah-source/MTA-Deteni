# Changelog

## P13.8401–8520 — Runtime Execution & Handoff Boundary

- Added a synthetic runtime execution context binding execution identity, runtime mode, device class, network scope, authentication and certification journey.
- Bound runtime execution to lifecycle and recovery certification records so runtime adapters cannot bypass certified application state.
- Added a contract-only LAN/offline runtime handoff with explicit authorization and reconciliation requirements.
- Added fail-closed runtime handoff checks for missing authorization, pending-queue reconciliation and non-cloud continuity.
- Added synthetic regression coverage for runtime/capability mismatch, certification mismatch, unauthenticated execution and unsafe handoff.
- No database driver, schema migration, production persistence, real detainee data or AI activation.

## P13.8281–8400 — Recovery/Lifecycle Cross-Step Certification

- Added a dedicated lifecycle-event envelope validator so event validation never substitutes `commandId` for `requestHash`.
- Bound recovery evidence directly to the matching lifecycle certification step across command, event, correlation, aggregate and version identities.
- Added deterministic recovery retry-key construction from command identity plus source fingerprint.
- Hardened recovery certification against retry-key and source-fingerprint drift.
- Added one synthetic regression matrix covering all seven governed failure classes through the recovery journey, including explicit offline reconnect review.
- Added cross-step identity/version tamper regression coverage.
- Preserved synthetic-only execution and all governance locks; no database driver, migration, production persistence, real detainee data or AI was introduced.

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
