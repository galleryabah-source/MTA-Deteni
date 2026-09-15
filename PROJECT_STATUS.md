# MTA DETENI — Project Status

**Version:** P10.108 Controlled Integration Boundary  
**Branch:** `phase10.14-database-verification-package`  
**Certification:** NOT CERTIFIED  
**Migration Freeze:** TRUE  
**AI:** OFF  
**Data Boundary:** SYNTHETIC ONLY

## Completed checkpoints

P9 kernel foundations; P10.1–P10.13 operational/domain/database-contract foundations; P10.14–P10.17 controlled database verification packages; P10.18–P10.21 document-output operationalization and runtime integration contracts; P10.22–P10.24 CI evidence, release-readiness and safety consolidation; P10.25–P10.34 runtime, authorization, document API, audit, transaction and security certification-readiness contracts; P10.35–P10.48 evidence and release hardening; P10.49–P10.54 controlled temporary-exit vertical slice and operational execution boundaries; P10.55–P10.60 operational state, read model, repository contract, unified service, transactional boundary and vertical-slice gate; P10.61–P10.68 command/runtime boundary contracts; P10.69–P10.76 persistence/release gates; P10.77–P10.84 synthetic persistent adapter and transaction boundary verification; P10.85–P10.92 persistent-boundary hardening and regression coverage; P10.93–P10.100 authenticated command, artifact grant and evidence-integrity boundary; P10.101–P10.108 controlled HTTP/application integration boundary.

## P10.101–P10.108 technical actions

- P10.101: bound the HTTP command gateway to the server-side authenticated command composer.
- P10.102: reject client actor/scope substitution before application execution.
- P10.103: require idempotency keys for mutation commands at the HTTP boundary.
- P10.104: verify the unified temporary-exit service can execute against the synthetic persistent-boundary adapter.
- P10.105: verify persistent-boundary scope enforcement occurs before mutation.
- P10.106: preserve request/correlation context through authoritative command composition.
- P10.107: preserve the provider-after-commit separation at the integration boundary.
- P10.108: verify the synthetic adapter exposes no provider/network operation surface.

## Integrated architecture

Authenticated HTTP request → CSRF → server-side authentication/authorization/scope/duty/classification/SoD → authoritative command composition → idempotency → unified temporary-exit application service → validation → document preparation → approval → issuance → artifact handoff → single-use controlled download grant → download → operational exit → handover → return → duty completion → close → critical transaction → persistent adapter → audit/outbox intent → commit → post-commit provider.

## Evidence gate

The deterministic regression gate now includes P10.101–P10.108. It remains synthetic and fail-closed. Required safety conditions remain `APP_ENV=test`, `AI_ENABLED=false`, and `MIGRATION_FREEZE=true`. Evidence includes a SHA-256 digest of test output and may not be promoted to certification merely because tests exist.

## Current decision

**BLOCKED FOR PRODUCTION / GOVERNANCE DECISION REQUIRED.** The authenticated command boundary is now connected to the HTTP gateway, while the persistent adapter remains synthetic. PostgreSQL production integration remains intentionally unopened. No migration or production write has been executed.

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

P10.109 onward: reconcile the unified service with the persistent artifact-grant transaction repository, strengthen audit-chain/evidence coupling, define the production PostgreSQL adapter contract and controlled verification matrix, and continue without schema execution until governance explicitly clears the migration-freeze boundary.
