# MTA DETENI — Project Status

**Version:** P10.92 Persistent Boundary Hardening & Regression Gate  
**Branch:** `phase10.14-database-verification-package`  
**Certification:** NOT CERTIFIED  
**Migration Freeze:** TRUE  
**AI:** OFF  
**Data Boundary:** SYNTHETIC ONLY

## Completed checkpoints

P9 kernel foundations; P10.1–P10.13 operational/domain/database-contract foundations; P10.14–P10.17 controlled database verification packages; P10.18–P10.21 document-output operationalization and runtime integration contracts; P10.22–P10.24 CI evidence, release-readiness and safety consolidation; P10.25–P10.34 runtime, authorization, document API, audit, transaction and security certification-readiness contracts; P10.35–P10.48 evidence and release hardening; P10.49–P10.54 controlled temporary-exit vertical slice and operational execution boundaries; P10.55–P10.60 operational state, read model, repository contract, unified service, transactional boundary and vertical-slice gate; P10.61–P10.68 command/runtime boundary contracts; P10.69–P10.76 persistence/release gates; P10.77–P10.84 synthetic persistent adapter and transaction boundary verification; P10.85–P10.92 persistent-boundary hardening and regression coverage.

## P10.85–P10.92 technical actions

- P10.85: added controlled failure injection to the synthetic persistence adapter for DOMAIN, AUDIT, OUTBOX and COMMIT stages.
- P10.86: verified failed critical commands leave no partial domain/audit/outbox/idempotency state and can be retried deterministically.
- P10.87: verified successful replay does not duplicate audit or outbox intent.
- P10.88: verified duplicate outbox event handling is fail-closed and rolls back the current command boundary.
- P10.89: verified provider operations are permitted only after a committed transaction.
- P10.90: verified migration freeze blocks schema changes while allowing ordinary runtime command execution.
- P10.91: verified missing mutation input fails closed before persistence side effects.
- P10.92: verified scope enforcement remains ahead of the mutation boundary.

## Integrated architecture

Authenticated HTTP request → CSRF → server-side authorization/scope/duty/classification/SoD → command identity/idempotency → unified temporary-exit application service → validation → document preparation → approval → issuance → artifact handoff → controlled download → operational exit → handover → return → duty completion → close → critical transaction → persistent adapter → audit/outbox intent → commit → post-commit provider.

The current persistent adapter is explicitly synthetic. It is an executable boundary model, not the production PostgreSQL adapter.

## Evidence gate

The deterministic runtime regression gate now includes P10.77–P10.92 and records a SHA-256 digest of test output. It is fail-closed when the required test environment is not `APP_ENV=test`, `AI_ENABLED=false`, and `MIGRATION_FREEZE=true`, or when required test files are missing.

No test result is promoted to certification merely because the test code exists. Independently observable CI execution remains required.

## Current decision

**BLOCKED FOR PRODUCTION / GOVERNANCE DECISION REQUIRED.** Certification remains fail-closed. No PostgreSQL migration or production write has been executed.

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

P10.93 onward: reconcile the synthetic boundary against the exact authenticated command composition, persistent artifact-grant transaction contract, audit-chain integrity, and controlled PostgreSQL verification prerequisites. These remain migration-free until governance explicitly clears controlled PostgreSQL execution.
