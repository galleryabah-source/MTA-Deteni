# MTA DETENI — Project Status

**Version:** P10.132 Controlled Concurrency Verification Harness  
**Branch:** `phase10.14-database-verification-package`  
**Certification:** NOT CERTIFIED  
**Migration Freeze:** TRUE  
**AI:** OFF  
**Data Boundary:** SYNTHETIC ONLY

## Completed checkpoints

P9 kernel foundations; P10.1–P10.13 operational/domain/database-contract foundations; P10.14–P10.17 controlled database verification packages; P10.18–P10.21 document-output operationalization and runtime integration contracts; P10.22–P10.24 CI evidence, release-readiness and safety consolidation; P10.25–P10.34 runtime, authorization, document API, audit, transaction and security certification-readiness contracts; P10.35–P10.48 evidence and release hardening; P10.49–P10.54 controlled temporary-exit vertical slice and operational execution boundaries; P10.55–P10.60 operational state, read model, repository contract, unified service, transactional boundary and vertical-slice gate; P10.61–P10.68 command/runtime boundary contracts; P10.69–P10.76 persistence/release gates; P10.77–P10.84 synthetic persistent adapter and transaction boundary verification; P10.85–P10.92 persistent-boundary hardening and regression coverage; P10.93–P10.100 authenticated command, artifact grant and evidence-integrity boundary; P10.101–P10.108 controlled HTTP/application integration boundary; P10.109–P10.116 controlled PostgreSQL adapter boundary specification; P10.117–P10.124 transaction/evidence hardening; P10.125–P10.132 synthetic concurrency/race verification.

## P10.125–P10.132 technical actions

- P10.125: synthetic concurrent consume harness proves one winner and fail-closed losers.
- P10.126: consume/revoke ordering is deterministic when revoke wins first.
- P10.127: expiry prevents consumption.
- P10.128–P10.130: actor, scope and object mismatches do not mutate state.
- P10.131: repeated concurrent revoke permits one transition only.
- P10.132: harness exposes no database or provider/network surface and is explicitly synthetic.
- Consolidated regression gate now covers through P10.132.

## Integrated architecture

Authenticated HTTP request → CSRF → server-side authentication/authorization/scope/duty/classification/SoD → authoritative command composition → idempotency → unified temporary-exit application service → validation → document preparation → approval → issuance → artifact handoff → single-use controlled download grant → download → operational exit → handover → return → duty completion → close → critical transaction → controlled PostgreSQL adapter → audit/outbox intent → commit → post-commit provider.

## Evidence gate

The deterministic regression gate covers through P10.132. The concurrency harness is a contract model, not proof of PostgreSQL isolation. Certification remains fail-closed and requires independently observable CI evidence with `APP_ENV=test`, `AI_ENABLED=false`, `MIGRATION_FREEZE=true`, complete required tests, and untampered evidence.

## Current decision

**BLOCKED FOR PRODUCTION / GOVERNANCE DECISION REQUIRED.** PostgreSQL remains unconnected for execution; no migration or production write has been performed. Live concurrency/expiry/race verification must occur only after explicit governance clearance of the migration-freeze boundary.

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

P10.133 onward: harden the controlled adapter verification contract and prepare evidence capture for a future governed PostgreSQL test run, without executing it while migration freeze remains TRUE.
