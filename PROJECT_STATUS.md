# MTA DETENI — Project Status

**Version:** P10.116 Controlled PostgreSQL Adapter Boundary  
**Branch:** `phase10.14-database-verification-package`  
**Certification:** NOT CERTIFIED  
**Migration Freeze:** TRUE  
**AI:** OFF  
**Data Boundary:** SYNTHETIC ONLY

## Completed checkpoints

P9 kernel foundations; P10.1–P10.13 operational/domain/database-contract foundations; P10.14–P10.17 controlled database verification packages; P10.18–P10.21 document-output operationalization and runtime integration contracts; P10.22–P10.24 CI evidence, release-readiness and safety consolidation; P10.25–P10.34 runtime, authorization, document API, audit, transaction and security certification-readiness contracts; P10.35–P10.48 evidence and release hardening; P10.49–P10.54 controlled temporary-exit vertical slice and operational execution boundaries; P10.55–P10.60 operational state, read model, repository contract, unified service, transactional boundary and vertical-slice gate; P10.61–P10.68 command/runtime boundary contracts; P10.69–P10.76 persistence/release gates; P10.77–P10.84 synthetic persistent adapter and transaction boundary verification; P10.85–P10.92 persistent-boundary hardening and regression coverage; P10.93–P10.100 authenticated command, artifact grant and evidence-integrity boundary; P10.101–P10.108 controlled HTTP/application integration boundary; P10.109–P10.116 controlled PostgreSQL adapter boundary specification.

## P10.109–P10.116 technical actions

- P10.109: defined the controlled PostgreSQL adapter contract with explicit transaction semantics.
- P10.110: migration-freeze guard rejects schema-changing adapter execution while freeze is active.
- P10.111: persistence adapter contract rejects provider/network operation surfaces.
- P10.112: artifact-grant consume contract requires one atomic, scoped, unexpired ACTIVE transition.
- P10.113: idempotency conflict semantics are explicit at the persistence boundary.
- P10.114: audit hash-chain material is required to remain transactionally coupled to the mutation.
- P10.115: scope enforcement remains deny-by-default.
- P10.116: controlled certification path remains AI-disabled.

## Integrated architecture

Authenticated HTTP request → CSRF → server-side authentication/authorization/scope/duty/classification/SoD → authoritative command composition → idempotency → unified temporary-exit application service → validation → document preparation → approval → issuance → artifact handoff → single-use controlled download grant → download → operational exit → handover → return → duty completion → close → critical transaction → controlled PostgreSQL adapter → audit/outbox intent → commit → post-commit provider.

## Evidence gate

The deterministic regression gate includes the P10.101–P10.108 controlled integration suite. The P10.109–P10.116 suite is defined but must be added to the consolidated gate in the next controlled change. All certification remains fail-closed: `APP_ENV=test`, `AI_ENABLED=false`, `MIGRATION_FREEZE=true`, complete tests, and independently observable CI evidence are required.

## Current decision

**BLOCKED FOR PRODUCTION / GOVERNANCE DECISION REQUIRED.** The PostgreSQL adapter is specified but deliberately not connected to a live database. No migration or production write has been executed.

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

P10.117 onward: add P10.109–P10.116 to the consolidated regression gate, reconcile artifact-grant issue/consume/revoke transaction semantics, strengthen audit-chain/evidence manifest coupling, and prepare the controlled database verification matrix without executing schema changes while migration freeze remains TRUE.
