# MTA DETENI — Project Status

**Version:** P10.140 Governed PostgreSQL Verification Readiness + CI Hardening  
**Branch:** `phase10.14-database-verification-package`  
**Certification:** NOT CERTIFIED  
**Migration Freeze:** TRUE  
**AI:** OFF  
**Data Boundary:** SYNTHETIC ONLY

## Completed checkpoints

P9 kernel foundations; P10.1–P10.13 operational/domain/database-contract foundations; P10.14–P10.17 controlled database verification packages; P10.18–P10.21 document-output operationalization and runtime integration contracts; P10.22–P10.24 CI evidence, release-readiness and safety consolidation; P10.25–P10.34 runtime, authorization, document API, audit, transaction and security certification-readiness contracts; P10.35–P10.48 evidence and release hardening; P10.49–P10.54 temporary-exit vertical slice and operational execution boundaries; P10.55–P10.60 operational state, read model, repository/unified/transactional boundaries; P10.61–P10.68 command/runtime boundary contracts; P10.69–P10.76 persistence/release gates; P10.77–P10.84 synthetic persistent adapter and transaction verification; P10.85–P10.92 persistent-boundary hardening; P10.93–P10.100 authenticated command, artifact grant and evidence-integrity boundary; P10.101–P10.108 controlled HTTP/application integration; P10.109–P10.116 controlled PostgreSQL adapter specification; P10.117–P10.124 transaction/evidence hardening; P10.125–P10.132 synthetic concurrency/race verification; P10.133–P10.140 governed PostgreSQL verification readiness.

## CI / failed-run audit and remediation

- P9 Kernel Run #385 and P10 Runtime Run #529 were observed as `failure`, but their GitHub job records contained no executable steps and their job-log endpoints returned `BlobNotFound`; therefore these runs do not provide evidence of a test assertion failure.
- Failed jobs were rerun. The rerun remained unsuccessful at the GitHub Actions execution layer without usable step-level evidence.
- Subsequent check runs on later commits also failed in a few seconds without executable step evidence. This remains an external GitHub Actions runner/execution blocker, not an established application assertion failure.
- No code change is being represented as a fix for an unobserved runner failure. The system remains fail-closed rather than hiding the failure with `continue-on-error` or skipped tests.
- P10 CI now uses `scripts/p10-runtime-regression-gate.mjs` as the single regression manifest, including the P9 kernel suite, eliminating duplicated and stale test lists in the workflow.
- P10 CI no longer includes the active implementation branch in the push trigger, avoiding duplicate push + pull-request workflow executions for PR #7.
- P9 pull-request execution is scoped to kernel-relevant paths; P10 changes no longer create unrelated P9 workflow noise unless kernel/dependency/workflow files are changed.
- Regression evidence is aligned to checkpoint P10.140.
- `package-lock.json` remains absent. CI therefore uses a temporary dependency bootstrap; reproducible lockfile-based certification remains blocked until a reviewed lockfile is committed.

## P10.133–P10.140 technical actions

- P10.133: PostgreSQL verification contract now explicitly separates synthetic modeling from live DB execution.
- P10.134: transaction verification requires BEGIN/COMMIT/ROLLBACK observability and same-client audit/outbox coupling.
- P10.135: concurrent consume verification requires exactly one affected row across competing requests.
- P10.136: expiry verification requires the SQL predicate to reject expired grants at the database boundary.
- P10.137: actor/scope/object mismatch verification remains fail-closed with zero-row rejection.
- P10.138: revoke race verification requires a single ACTIVE → REVOKED winner.
- P10.139: provider isolation and migration-freeze controls remain mandatory evidence dimensions.
- P10.140: governance-ready verification package explicitly records prerequisites, evidence, rollback and abort conditions; it does not execute them.

## Integrated architecture

Authenticated HTTP request → CSRF → server-side authentication/authorization/scope/duty/classification/SoD → authoritative command composition → idempotency → unified temporary-exit service → document preparation → approval → issuance → artifact handoff → single-use controlled download grant → download → operational exit → handover → return → duty completion → close → critical transaction → controlled PostgreSQL adapter → audit/outbox intent → COMMIT → post-commit provider.

## Evidence gate

Synthetic concurrency testing is not PostgreSQL certification. A governed DB verification must independently observe transaction boundaries, atomic affected-row semantics, concurrent behavior, expiry enforcement, authorization scope, rollback, provider isolation and migration-freeze state. No PASS or production-readiness claim is permitted without CI/evidence artifacts.

## Current decision

**BLOCKED FOR PRODUCTION / GOVERNANCE DECISION REQUIRED.** No live PostgreSQL verification, migration, schema change, or production write has been executed. The next executable DB step requires explicit governance clearance of the migration-freeze boundary and a controlled non-production database target.

## Safety

- Migration Freeze TRUE.
- No schema migration executed.
- No production database operation.
- AI OFF.
- Synthetic fixtures/test doubles only.
- No provider activation.
- No real detainee data/secrets.
- `main` remains untouched by implementation commits.

## Next gates

P10.141+: governed verification evidence schema and controlled test-run orchestration design, still without executing live DB operations until governance clears the freeze.
