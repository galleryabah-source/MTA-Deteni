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
- Explicitly prevented checkpoint inflation: no new numbered ranges are added solely to increase checkpoint counts.
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

## P13.232881–246880 — Attestation Closure (100 Checkpoints)

- Extended the governed P13 chain across exactly 100 sequential checkpoints from P13.232881 through P13.246880.
- Added an attestation-closure boundary binding artifact, parent artifact, decision fingerprint and distinct attestation identity/fingerprint.
- Enforced fail-closed identity alias rejection and deterministic identity-bound ADMIT / REPLAY / CONFLICT semantics.
- Preserved immutable, synthetic-only, review-only and explicitly non-executable behavior.
- Added regression coverage for cardinality, sequence, immutability, governance locks, replay, fingerprint drift and identity aliasing.
- CI remains observation-only unless observable workflow evidence is available.

## P13.218881–232880 — Integrated Integrity-Audit Terminal Closure Certification Seal Receipt Attestation (100 Checkpoints)

- Extended the governed chain across exactly 100 sequential checkpoints from P13.218881 through P13.232880.
- Added an attestation layer binding the preceding artifact, closure, audit, certification, seal and receipt identities to a distinct attestation identity and decision fingerprint.
- Enforced fail-closed continuity validation and deterministic identity-bound replay semantics.
- Preserved immutable, synthetic-only, review-only and explicitly non-executable certification behavior.
- No authorization, dispatch approval, external transport request, dispatch execution or durable publication capability is introduced.
- Added regression coverage for checkpoint cardinality, immutability, governance locks, replay, fingerprint drift and continuity failures.
- CI remains observation-only unless observable workflow evidence is available.

## P13.204881–218880 — Integrated Integrity-Audit Terminal Closure Certification Seal Receipt (100 Checkpoints)

- Extended the governed P13 chain across exactly 100 sequential checkpoints from P13.204881 through P13.218880.
- Added a certification-seal receipt contract binding the preceding artifact, closure, audit, certification and seal identities to a distinct receipt identity and receipt decision fingerprint.
- Enforced fail-closed continuity validation, including rejection of artifact aliasing, fingerprint aliasing and receipt/seal identity collisions.
- Preserved deterministic in-memory `ADMIT` / `REPLAY` / `CONFLICT` semantics with an identity-bound replay key.
- Certification remains immutable, synthetic-only, review-only and explicitly non-executable.
- No authorization, dispatch approval, external transport request, dispatch execution or durable publication capability is introduced.
- Added regression coverage for checkpoint cardinality, immutability, governance locks, deterministic replay, fingerprint drift and continuity failures.
- CI remains observation-only unless observable workflow evidence is available.

## P13.190881–204880 — Integrated Integrity-Audit Terminal Closure Certification Seal (100 Checkpoints)

- Extended the governed P13 chain across exactly 100 sequential checkpoints from P13.190881 through P13.204880.
- Added a certification-seal contract binding the preceding artifact, closure, audit and certification identities to a distinct seal identity and seal decision fingerprint.
- Enforced fail-closed continuity validation, including rejection of artifact aliasing, fingerprint aliasing and seal/certification identity collisions.
- Preserved deterministic in-memory `ADMIT` / `REPLAY` / `CONFLICT` semantics with an identity-bound replay key.
- Certification remains immutable, synthetic-only, review-only and explicitly non-executable.
- No authorization, dispatch approval, external transport request, dispatch execution or durable publication capability is introduced.
- Added regression coverage for checkpoint cardinality, immutability, governance locks, deterministic replay, fingerprint drift and continuity failures.
- CI remains observation-only unless observable workflow evidence is available.

## P13.176881–190880 — Integrated Integrity-Audit Terminal Closure Certification Continuation (100 Checkpoints)

- Extended the governed P13 chain across exactly 100 sequential checkpoints from P13.176881 through P13.190880.
- Added a certification-continuation contract binding artifact, parent-closure, audit decision-fingerprint and continuity-certificate identity.
- Enforced fail-closed identity validation, including rejection of certificate/artifact aliasing and continuity mismatches.
- Preserved deterministic in-memory `ADMIT` / `REPLAY` / `CONFLICT` semantics with an identity-bound replay key.
- Certification remains immutable, synthetic-only, review-only and explicitly non-executable.
- No authorization, dispatch approval, external transport request, dispatch execution or durable publication capability is introduced.
- Added regression coverage for checkpoint cardinality, immutability, governance locks, deterministic replay, fingerprint drift and continuity failures.
- CI remains observation-only unless observable workflow evidence is available.

## P13.162881–176880 — Integrated Integrity-Audit Terminal Closure Continuation (100 Checkpoints)

- Extended the governed P13 chain across exactly 100 sequential checkpoints from P13.162881 through P13.176880.
- Added a coherent terminal-closure continuation contract preserving artifact, parent-closure and audit decision-fingerprint continuity.
- Enforced fail-closed identity validation and deterministic in-memory `ADMIT` / `REPLAY` / `CONFLICT` semantics.
- Certification remains immutable, synthetic-only, review-only and explicitly non-executable.
- No authorization, dispatch approval, external transport request, dispatch execution or durable publication capability is introduced.
- Added regression coverage for checkpoint cardinality, immutability, replay determinism, fingerprint drift and continuity mismatch.
- CI remains observation-only unless observable workflow evidence is available.

## P13.134881–148880 — Integrated Integrity-Audit Terminal Closure Boundary Extension (100 Checkpoints)

- Extended the governed chain across exactly 100 sequential checkpoints from P13.134881 through P13.148880 in five auditable modules (A–E).
- Added the next terminal-closure boundary layer while preserving parent-artifact and decision-fingerprint continuity.
- Enforced fail-closed artifact and fingerprint continuity validation.
- Preserved deterministic in-memory `ADMIT` / `REPLAY` / `CONFLICT` semantics with identity-bound replay keys.
- Certification remains immutable, synthetic-only, review-only and explicitly non-executable.
- No authorization, dispatch approval, external transport request, dispatch execution or durable publication capability is introduced.
- Added regression coverage asserting exactly 100 unique checkpoint labels, immutable review-only state, deterministic replay, drift conflict and continuity-failure behavior.
- CI remains observation-only unless observable workflow evidence is available.

## P13.121281–134880 — Integrated Integrity-Audit Terminal Closure Boundary (100 Checkpoints)

- Extended the governed P13 chain across exactly 100 sequential checkpoints from P13.121281 through P13.134880.
- Added a terminal-closure boundary contract connecting each review artifact to its preceding closure artifact and audit decision fingerprint.
- Enforced fail-closed artifact and fingerprint continuity validation.
- Preserved deterministic in-memory `ADMIT` / `REPLAY` / `CONFLICT` semantics with identity-bound replay keys.
- Certification remains immutable, synthetic-only, review-only and explicitly non-executable.
- No authorization, dispatch approval, external transport request, dispatch execution or durable publication capability is introduced.
- Added regression coverage asserting exactly 100 unique checkpoint labels, immutable review-only state, deterministic replay, drift conflict and continuity-failure behavior.
- CI remains observation-only unless observable workflow evidence is available.
