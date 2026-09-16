# Changelog

## Governance Fix — Cloudflare Deployment Boundary + Documentation Synchronization

- Changed `.github/workflows/cloudflare-deploy.yml` from real deployment to validation-only using `wrangler deploy --dry-run`.
- Removed Cloudflare API credential usage from the workflow so CI cannot implicitly perform a Cloudflare deployment.
- Added an explicit governance comment and validation job boundary: no real deployment while Production Access is NOT AUTHORIZED and no controlled non-production target has been approved.
- Synchronized `PROJECT_STATUS.md` and `P13_EXIT_CRITERIA.md` with the current P13 observation state and Cloudflare boundary.
- Clarified that `src/application/outbox-runtime-contract.ts` is the canonical P9.8 runtime contract and the older `src/application/outbox-contract.ts` is retained only as a compatibility artifact.
- No schema migration, live PostgreSQL execution, production access, AI activation, external transport, durable publication, real detainee data or production PII was introduced.

## P9.8 — Governed Outbox Contract

- Added `src/application/outbox-runtime-contract.ts` defining the validated pending-outbox boundary with event identity, aggregate identity, event type, payload fingerprint, timestamp, status and attempt count.
- Added immutable event construction that starts only in `PENDING` state with zero attempts.
- Added fail-closed validation for missing outbox identity, invalid attempt counts and non-pending append state.
- Kept append behind a dedicated store boundary returning deterministic `ADMIT` / `REPLAY` / `CONFLICT` dispositions.
- Added `test/outbox-runtime-contract.test.ts` covering immutable pending creation, invalid input rejection and mandatory append routing.
- Runtime remains unbound: no PostgreSQL connection, SQL execution, migration, external transport or durable publication was introduced.

## P9.7 — Transaction + Idempotency Boundary Contract

- Added `src/application/transaction-idempotency-boundary.ts` to bind transaction identity and idempotency identity at one explicit application boundary.
- Preserved deterministic `EXECUTE` / `REPLAY` / `CONFLICT` semantics by delegating to the existing idempotency contract.
- Added a database-transaction helper that commits only after successful work and rolls back on domain/evidence failure.
- Added regression coverage for deterministic decisions, missing identity fail-closed behavior, commit-after-success and rollback-on-failure.
- Runtime remains unbound: no PostgreSQL connection, SQL execution, migration or schema change was introduced.

## P9.6 — Governed Database Adapter Contract

- Added `src/application/database-adapter-contract.ts` defining the application/read-only database adapter boundary, typed query/result contracts, transaction handle contract and lifecycle state.
- Added fail-closed configuration validation for database URL, pool size and statement timeout.
- Explicitly blocked the migration database role while Migration Freeze remains active.
- Kept the adapter runtime unbound: no PostgreSQL connection, migration, schema change or live database execution is introduced by this contract.
- Added `test/database-adapter-contract.test.ts` covering configuration validation, migration-role blocking, non-executable runtime binding and transaction identity validation.
- This is a contract/reconciliation boundary only; actual PostgreSQL binding requires a later governance-cleared non-production target.

## P13.260881–274880 — Integrity Certification Evidence Continuation (100 Checkpoints)

- Extended the governed P13 chain across exactly 100 sequential checkpoints from P13.260881 through P13.274880.
- Added an integrity-certification-evidence continuation boundary binding the base artifact/parent identity to distinct certification and evidence identities and decision fingerprints.
- Enforced fail-closed identity alias rejection and deterministic identity-bound `ADMIT` / `REPLAY` / `CONFLICT` semantics.
- Certification fails closed on replay fingerprint drift and returns only immutable review evidence.
- Preserved synthetic-only, review-only and explicitly non-executable behavior.
- Added regression coverage for cardinality, sequence, immutability, governance locks, replay, drift conflict, fail-closed certification and identity aliasing.
- No schema migration, live PostgreSQL execution, production access, AI activation, external transport, durable publication, real detainee data or production PII was introduced.
- CI remains observation-only unless observable workflow evidence is available.
