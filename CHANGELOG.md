# Changelog

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
- P9.13: added kernel certification aggregate gate over required control results; certification cannot grant production access, execute migrations or enable AI.
- Added regression coverage for P9.11 and P9.13 fail-closed behavior.
- Hardened GitHub Actions CI with deterministic typecheck/test stages, execution-evidence validation, artifact verification and concurrency control.
- Recent GitHub Actions infrastructure did not expose usable steps/logs for the latest runs, so observable CI certification remains pending; no false PASS is recorded.

## Governance Fix — Cloudflare Deployment Boundary + Documentation Synchronization

- Changed `.github/workflows/cloudflare-deploy.yml` from real deployment to validation-only using `wrangler deploy --dry-run`.
- Removed Cloudflare API credential usage from the workflow so CI cannot implicitly perform a Cloudflare deployment.
- Synchronized project status and P13 exit assessment with the controlled deployment boundary.
- Clarified that `src/application/outbox-runtime-contract.ts` is the canonical P9.8 runtime contract and the older `src/application/outbox-contract.ts` is compatibility-only.

## P9.8 — Governed Outbox Contract

- Added `src/application/outbox-runtime-contract.ts` defining the validated pending-outbox boundary with event identity, aggregate identity, event type, payload fingerprint, timestamp, status and attempt count.
- Added immutable event construction that starts only in `PENDING` state with zero attempts.
- Added fail-closed validation for missing outbox identity, invalid attempt counts and non-pending append state.
- Kept append behind a dedicated store boundary returning deterministic `ADMIT` / `REPLAY` / `CONFLICT` dispositions.
- Added regression coverage for immutable pending creation, invalid input rejection and mandatory append routing.

## P9.7 — Transaction + Idempotency Boundary Contract

- Added transaction + idempotency boundary with deterministic `EXECUTE` / `REPLAY` / `CONFLICT` semantics and commit-after-success / rollback-on-failure behavior.
