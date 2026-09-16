# Changelog

## P9.9–P9.13 — Runtime Governance Contract Continuation

- P9.9: added private/restricted storage contract with object identity, content fingerprint, replay safety and content-drift detection.
- P9.10: added structured observability contract with event, request, correlation and optional transaction identity plus explicit outcome levels.
- P9.11: added controlled execution harness evidence contract with fail-closed validation of environment, commit, checks, status and exit codes.
- P9.12: added CI certification contract; certification requires a valid controlled-nonprod `OBSERVED_PASS` and available evidence artifact.
- P9.13: added kernel certification aggregate gate over required control results; certification cannot grant production access, execute migrations or enable AI.
- Added regression coverage for P9.11 and P9.13 fail-closed behavior.
- Hardened GitHub Actions CI with deterministic typecheck/test stages, execution-evidence validation, artifact verification and concurrency control.
- Recent GitHub Actions infrastructure did not expose usable steps/logs for the latest runs, so observable CI certification remains pending; no false PASS is recorded.
- No schema migration, live PostgreSQL execution, production access, AI activation, external transport, durable publication, real detainee data or production PII was introduced.

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

## P9.6 — Governed Database Adapter Contract

- Added typed database adapter, transaction and lifecycle contracts with fail-closed configuration validation and migration-role blocking.

## P13.260881–274880 — Integrity Certification Evidence Continuation (100 Checkpoints)

- Extended the governed P13 chain across exactly 100 sequential checkpoints from P13.260881 through P13.274880.
- Preserved fail-closed identity continuity, deterministic replay semantics, synthetic-only and review-only behavior.
- P13 remains observation-pending until controlled workflow evidence is observable.
