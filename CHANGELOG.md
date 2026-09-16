# Changelog

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

## P1 Runtime Integrity — Optimistic Concurrency Contract

- Added `src/application/optimistic-concurrency-contract.ts` with deterministic expected-version validation and `ACCEPT` / `STALE_VERSION` decisions.
- Added immutable aggregate-version advancement and fail-closed invalid-version handling.
- Added `test/optimistic-concurrency-contract.test.ts` covering exact-version acceptance, stale-version rejection, immutable increment and invalid input.
- Updated `PROJECT_STATUS.md` to record P1 runtime integrity remediation in progress.
- No schema migration, live PostgreSQL execution, production access, AI activation, real detainee data or production PII was introduced.

## P13 Closure Audit — Exit Criteria and CI Gate Repair

- Added `P13_EXIT_CRITERIA.md` with eight evidence-based closure criteria covering scope, identity continuity, replay determinism, non-executable boundaries, regression coverage, observable CI execution, documentation synchronization and governance locks.
- Explicitly prevented checkpoint inflation: no new numbered ranges are added solely to increase counts.
- Repaired `.github/scripts/mta-contract-gate.mjs` so the CI gate evaluates the current P13 closure candidate rather than stale historical `PROJECT_STATUS_NEXT.md` checkpoint values and obsolete vocabulary checks.
- Updated `PROJECT_STATUS.md` to record the current closure audit and keep P13 at **IMPLEMENTED CONTRACTS / OBSERVATION PENDING** until observable controlled-nonprod workflow evidence exists.
- No schema migration, live PostgreSQL execution, production access, AI activation, external transport, durable publication, real detainee data or production PII was introduced.

## P13.246881–260880 — Attestation Closure Certification (100 Checkpoints)

- Extended the governed P13 chain across exactly 100 sequential checkpoints from P13.246881 through P13.260880.
- Added an attestation-closure certification boundary binding the base artifact/parent identity to distinct attestation-closure and certification identities and decision fingerprints.
- Enforced fail-closed identity alias rejection and deterministic identity-bound `ADMIT` / `REPLAY` / `CONFLICT` semantics.
- Certification fails closed on replay fingerprint drift and returns only immutable review evidence.
- Preserved synthetic-only, review-only and explicitly non-executable behavior.
- Added regression coverage for cardinality, sequence, immutability, governance locks, replay, drift conflict, fail-closed certification and identity aliasing.
- CI remains observation-only unless observable workflow evidence is available.
