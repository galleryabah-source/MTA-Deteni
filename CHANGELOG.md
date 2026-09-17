# Changelog

## 2026-09-17 — Integrated Audit Reconciliation

- Completed a repository-level integrated audit across governance, master blueprint, domain architecture, P9/P1 runtime contracts, QR, reporting/document, offline/local continuity, CI and Cloudflare deployment boundaries.
- Confirmed that the current architecture is coherent and does not require a rebuild from the beginning; the active priority is runtime integration proof and observable evidence rather than additional checkpoint expansion.
- Corrected `AUDIT_REMEDIATION_PRIORITY.md`, which contained a stale baseline `P13.260880`; it now references the authoritative terminal governed range `P13.260881–274880`.
- Added explicit audit priorities for QR/device readiness, canonical runtime/renderer paths and integrated offline/reconnect verification.
- Reaffirmed that P13 remains OPEN until all eight exit criteria have observable evidence, including P13-EXIT-06 controlled-nonprod workflow execution and evidence artifact.
- No schema migration, live production database execution, production access, AI activation, real detainee data, production PII or external durable publication was introduced.

## CI — Contract Gate Synchronization

- Observable Run #927 reached dependency installation successfully after removal of the lockfile-dependent npm cache configuration.
- The next concrete failure was in the static contract gate: `ARCH-5814` checked an outdated evidence artifact name, and `STATE-5820` still referenced the superseded P13 range `P13.246881–260880`.
- Corrected the contract gate to recognize the current controlled-execution evidence artifact naming and the current terminal governed range `P13.260881–274880`.
- The gate remains fail-closed and continues to emit `contract-gate.json` before returning its exit status.
- Runtime certification and P13-EXIT-06 remain pending until a subsequent run reaches typecheck, tests, controlled execution harness and valid evidence validation.
- No schema migration, live PostgreSQL execution, production access, AI activation, external transport, durable publication, real detainee data or production PII was introduced.

## CI — Lockfile Prerequisite Remediation

- Observable GitHub Actions Run #925 exposed a concrete workflow failure: `actions/setup-node@v7` with `cache: npm` requires a lockfile, while the repository intentionally uses `npm install` and did not contain `package-lock.json`, `npm-shrinkwrap.json` or `yarn.lock`.
- Removed the `cache: npm` requirement from `.github/workflows/mta-domain-ci.yml` rather than manufacturing an unverified lockfile or changing dependency resolution semantics.
- The workflow remains `controlled-nonprod`, installs from the declared package manifest with `npm install`, and retains mandatory evidence validation and artifact upload.
- Runtime certification remains pending until a new run reaches the actual build/test/harness stages and exposes valid evidence.
- No schema migration, live PostgreSQL execution, production access, AI activation, external transport, durable publication, real detainee data or production PII was introduced.

## P1 — Executable Runtime Certification + Failure Matrix

- Added `src/application/p1-runtime-certification.ts` with a fixed seven-control evidence contract covering canonical context continuity, idempotency, transaction, audit, outbox, observability and failure-matrix behavior.
- Certification evidence requires `controlled-nonprod`, a resolved commit and explicit false governance-lock flags for production authorization, migration execution and AI activation.
- Added `test/p1-runtime-certification.test.ts` covering complete evidence, missing/duplicate controls, unresolved commit, governance-lock violations, pending/failed controls and PASS/exit-code inconsistency.
- Added `test/p1-runtime-failure-matrix.test.ts` covering missing context, idempotency conflict, replay, domain failure, audit failure and outbox conflict/replay fail-closed behavior.
- The certification contract is non-authorizing and does not enable production access, migrations, AI, external transport or durable publication.
- P1 runtime certification remains pending until an actual repository execution produces observable evidence; contract-level test coverage is not recorded as runtime PASS.
- No schema migration, live PostgreSQL execution, production access, AI activation, external transport, durable publication, real detainee data or production PII was introduced.

## P1 — Unified Critical Mutation Context + Failure Matrix

- Added a dedicated critical-mutation context gate that establishes one immutable canonical execution context for request, correlation, transaction and idempotency identities.
- Critical mutation continues through the canonical runtime outbox and transaction boundaries without introducing a second identity model.
- Corrected and strengthened the synthetic critical-mutation failure matrix to cover incomplete context rejection before transaction execution, replay, idempotency conflict, domain failure, audit failure and outbox conflict.
- No schema migration, live PostgreSQL execution, production access, AI activation, external transport, durable publication, real detainee data or production PII was introduced.

## P1 — Canonical Execution Context Continuity

- Bound `TransactionContext` directly to the canonical execution-context contract so request, correlation, transaction and idempotency identities cannot diverge by type definition.
- Critical mutation orchestration now normalizes and freezes one canonical execution context before idempotency and transaction execution.
- Added an executable regression proving normalized context identity reaches the transaction boundary unchanged.
- Added explicit observability context-continuity validation against the canonical execution context.
- Added regression coverage for observability request/transaction identity drift.
- No schema migration, live PostgreSQL execution, production access, AI activation, external transport, durable publication, real detainee data or production PII was introduced.

## P9.12–P9.13 — Canonical Evidence Hardening

- P9.12 CI certification now has regression coverage for complete observed `controlled-nonprod` harness evidence.
- CI evidence validation now requires the exact canonical harness control set: `BUILD-5801`, `BUILD-5802`, `BUILD-5803`, `REG-5804`, `REG-5805`.
- Evidence with missing canonical controls, duplicate controls, failed checks or nonzero PASS exit codes is rejected.
- P9.13 continues to require the complete canonical P9.9–P9.12 kernel control set and remains non-authorizing.
- Project status synchronized with the strengthened evidence boundary.
- No schema migration, live PostgreSQL execution, production access, AI activation, external transport, durable publication, real detainee data or production PII was introduced.

## P9.9–P9.13 — Runtime Governance Contract Continuation

- P9.9: added private/restricted storage contract with object identity, content fingerprint, replay safety and content-drift detection.
- P9.10: added structured observability contract with event, request, correlation and optional transaction identity plus explicit outcome levels.
- P9.11: added controlled execution harness evidence contract with fail-closed validation of environment, commit, checks, status and exit codes.
- P9.12: added CI certification contract; certification requires a valid controlled-nonprod `OBSERVED_PASS` and available evidence artifact.
