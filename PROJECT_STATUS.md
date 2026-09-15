# MTA DETENI — Project Status

**Version:** P10.124 Transaction & Evidence Hardening  
**Branch:** `phase10.14-database-verification-package`  
**Certification:** NOT CERTIFIED  
**Migration Freeze:** TRUE  
**AI:** OFF  
**Data Boundary:** SYNTHETIC ONLY

## Completed checkpoints

P9 kernel foundations; P10.1–P10.13 operational/domain/database-contract foundations; P10.14–P10.17 controlled database verification packages; P10.18–P10.21 document-output operationalization and runtime integration contracts; P10.22–P10.24 CI evidence, release-readiness and safety consolidation; P10.25–P10.34 runtime, authorization, document API, audit, transaction and security certification-readiness contracts; P10.35–P10.48 evidence and release hardening; P10.49–P10.54 controlled temporary-exit vertical slice and operational execution boundaries; P10.55–P10.60 operational state, read model, repository contract, unified service, transactional boundary and vertical-slice gate; P10.61–P10.68 command/runtime boundary contracts; P10.69–P10.76 persistence/release gates; P10.77–P10.84 synthetic persistent adapter and transaction boundary verification; P10.85–P10.92 persistent-boundary hardening and regression coverage; P10.93–P10.100 authenticated command, artifact grant and evidence-integrity boundary; P10.101–P10.108 controlled HTTP/application integration boundary; P10.109–P10.116 controlled PostgreSQL adapter boundary specification; P10.117–P10.124 transaction/evidence hardening.

## P10.117–P10.124 technical actions

- P10.117: added transactional consume boundary for persistent artifact grants.
- P10.118: added transactional revoke boundary with fail-closed affected-row semantics.
- P10.119: verified audit callback failure rolls back the critical transaction.
- P10.120–P10.122: bound an explicit audit evidence anchor (`eventCount` + `headHash`) into the release evidence manifest and added tamper detection.
- P10.123: preserved provider/network isolation from the critical transaction.
- P10.124: added the controlled PostgreSQL verification matrix for concurrency, expiry, scope, rollback, provider isolation, migration freeze and AI-off controls.
- Consolidated regression gate now includes P10.109–P10.116 and the P10.117–P10.124 hardening suite.

## Integrated architecture

Authenticated HTTP request → CSRF → server-side authentication/authorization/scope/duty/classification/SoD → authoritative command composition → idempotency → unified temporary-exit application service → validation → document preparation → approval → issuance → artifact handoff → single-use controlled download grant → download → operational exit → handover → return → duty completion → close → critical transaction → controlled PostgreSQL adapter → audit/outbox intent → commit → post-commit provider.

## Evidence gate

The deterministic regression gate now covers through P10.124. A local or repository test definition is not certification by itself. Certification remains fail-closed and requires independently observable CI evidence with `APP_ENV=test`, `AI_ENABLED=false`, `MIGRATION_FREEZE=true`, complete required tests, and untampered evidence.

## Current decision

**BLOCKED FOR PRODUCTION / GOVERNANCE DECISION REQUIRED.** The PostgreSQL adapter remains a controlled boundary and is deliberately not connected to a live database. No migration or production write has been executed.

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

P10.125 onward: controlled PostgreSQL adapter verification planning, including a transaction-capable test harness for concurrency/expiry/revoke races, followed by governance review before any freeze-lift or live database execution. No schema change is authorized by this status update.
