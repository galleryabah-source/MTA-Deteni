# MTA DETENI — Project Status

**Version:** P10.84 Synthetic Persistent Adapter & Transaction Boundary  
**Branch:** `phase10.14-database-verification-package`  
**Certification:** NOT CERTIFIED  
**Migration Freeze:** TRUE  
**AI:** OFF  
**Data Boundary:** SYNTHETIC ONLY

## Completed checkpoints

P9 kernel foundations; P10.1–P10.13 operational/domain/database-contract foundations; P10.14–P10.17 controlled database verification packages; P10.18–P10.21 document-output operationalization and runtime integration contracts; P10.22–P10.24 CI evidence, release-readiness and safety consolidation; P10.25–P10.34 runtime, authorization, document API, audit, transaction and security certification-readiness contracts; P10.35–P10.48 evidence and release hardening; P10.49–P10.54 controlled temporary-exit vertical slice and operational execution boundaries; P10.55–P10.60 operational state, read model, repository contract, unified service, transactional boundary and vertical-slice gate; P10.61–P10.68 command/runtime boundary contracts; P10.69–P10.76 persistence/release gates; P10.77–P10.84 synthetic persistent adapter and transaction boundary verification.

## P10.77–P10.84 technical actions

- P10.77: implemented a synthetic temporary-exit persistence adapter satisfying the repository contract without PostgreSQL access.
- P10.78: aligned adapter domain mutation with the kernel transaction model.
- P10.79: verified deterministic idempotency replay/conflict behavior through the adapter boundary.
- P10.80: verified scope denial occurs before mutation.
- P10.81: made adapter record state rollback atomic with the synthetic critical transaction boundary.
- P10.82: verified provider/network operations are absent from the persistence adapter.
- P10.83: verified the synthetic adapter exposes no direct SQL/query surface.
- P10.84: extended the deterministic runtime regression gate to include P10.77–P10.84.

## Integrated architecture

Authenticated HTTP request → CSRF → server-side authorization/scope/duty/classification/SoD → command identity/idempotency → unified temporary-exit application service → validation → document preparation → approval → issuance → artifact handoff → controlled download → operational exit → handover → return → duty completion → close → critical transaction → persistent adapter → audit/outbox intent → commit → post-commit provider.

The current persistent adapter is explicitly synthetic. It is an executable boundary model, not the production PostgreSQL adapter.

## Current decision

**BLOCKED FOR PRODUCTION / GOVERNANCE DECISION REQUIRED.** Certification remains fail-closed. The regression gate is prepared for P10.84, but no PASS is claimed until independently observable CI evidence is available.

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

P10.85–P10.92: persistent-adapter contract parity, transactional failure-injection matrix, audit-chain/outbox coupling verification, artifact-grant persistence boundary, authenticated endpoint command composition, and release evidence integrity. These remain adapter-neutral and migration-free until governance explicitly clears controlled PostgreSQL execution.
