# MTA DETENI — Project Status

**Version:** P10.68 Persistence & Runtime Readiness Contracts  
**Branch:** `phase10.14-database-verification-package`  
**Certification:** NOT CERTIFIED  
**Migration Freeze:** TRUE  
**AI:** OFF  
**Data Boundary:** SYNTHETIC ONLY

## Completed checkpoints

P9 kernel foundations; P10.1–P10.13 operational/domain/database-contract foundations; P10.14–P10.17 controlled database verification packages; P10.18–P10.21 document-output operationalization and runtime integration contracts; P10.22–P10.24 CI evidence, release-readiness and safety consolidation; P10.25–P10.34 runtime, authorization, document API, audit, transaction and security certification-readiness contracts; P10.35–P10.48 evidence and release hardening; P10.49–P10.54 controlled temporary-exit vertical slice and operational execution boundaries; P10.55 explicit operational state machine; P10.56 unified operational read model; P10.57 persistence repository contract; P10.58 unified temporary-exit application service; P10.59 transactional rollback boundary; P10.60 vertical-slice regression gate; P10.61–P10.68 persistence and runtime readiness contracts.

## P10.61–P10.68 technical actions

- P10.61: repository transaction semantics require atomic business-state persistence and coordinated timeline/audit/outbox handling.
- P10.62: mutating commands require scoped idempotency identity and conflict detection.
- P10.63: actor/scope identity is server-bound; client claims cannot override authorization context.
- P10.64: application operational state remains distinct from detainee domain lifecycle.
- P10.65: timeline persistence remains append-only and terminal after CLOSE.
- P10.66: audit/outbox intent remains inside the critical transaction; providers run only after commit.
- P10.67: artifact/download persistence remains immutable, scoped, expiring, revocable and single-use.
- P10.68: authenticated API/runtime integration must expose the application service without browser-direct database mutation.

A new command-boundary contract and persistence/runtime boundary tests were added. They remain synthetic and do not execute PostgreSQL, migration, providers, AI, or production data.

## Integrated architecture

Authenticated HTTP request → CSRF → server-side authorization/scope/duty/classification/SoD → command identity/idempotency → unified temporary-exit application service → validation → document preparation → approval → issuance → artifact handoff → controlled download → operational exit → handover → return → duty completion → close → critical transaction → audit/outbox → commit → post-commit provider.

## Current decision

**BLOCKED FOR PRODUCTION / GOVERNANCE DECISION REQUIRED.** Certification remains fail-closed. GitHub currently reports the implementation PR as open/draft and non-mergeable; no merge is performed.

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

P10.69–P10.76: persistent repository integration, transactional command composition, operational endpoint matrix, UI workflow state integration, and contract-integrity verification. These gates must remain adapter-neutral until governance authorizes controlled PostgreSQL integration.
