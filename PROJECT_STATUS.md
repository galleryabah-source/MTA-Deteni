# MTA DETENI — Project Status

**Version:** P10.100 Authenticated Boundary, Artifact Grant & Evidence Integrity  
**Branch:** `phase10.14-database-verification-package`  
**Certification:** NOT CERTIFIED  
**Migration Freeze:** TRUE  
**AI:** OFF  
**Data Boundary:** SYNTHETIC ONLY

## Completed checkpoints

P9 kernel foundations; P10.1–P10.13 operational/domain/database-contract foundations; P10.14–P10.17 controlled database verification packages; P10.18–P10.21 document-output operationalization and runtime integration contracts; P10.22–P10.24 CI evidence, release-readiness and safety consolidation; P10.25–P10.34 runtime, authorization, document API, audit, transaction and security certification-readiness contracts; P10.35–P10.48 evidence and release hardening; P10.49–P10.54 controlled temporary-exit vertical slice and operational execution boundaries; P10.55–P10.60 operational state, read model, repository contract, unified service, transactional boundary and vertical-slice gate; P10.61–P10.68 command/runtime boundary contracts; P10.69–P10.76 persistence/release gates; P10.77–P10.84 synthetic persistent adapter and transaction boundary verification; P10.85–P10.92 persistent-boundary hardening and regression coverage; P10.93–P10.100 authenticated command, artifact grant and evidence-integrity boundary.

## P10.93–P10.100 technical actions

- P10.93: introduced a server-side authenticated command composer; principal identity is authoritative and client actor/scope claims cannot replace it.
- P10.94: added explicit authority-context ownership validation and fail-closed mismatch handling.
- P10.95: added synthetic single-use artifact grants bound to artifact, actor and scope; only a SHA-256 token digest is persisted by the model.
- P10.96: added deterministic expiry, revocation and consumed-state protections for controlled document download grants.
- P10.97: retained provider-after-commit enforcement as a mandatory boundary.
- P10.98: added release-evidence manifest generation binding commit, safety state, test results and file digests.
- P10.99: made evidence promotion fail-closed for unsafe release state, failed tests or incomplete file digests.
- P10.100: extended the deterministic runtime regression gate through the complete P10.93–P10.100 boundary suite.

## Integrated architecture

Authenticated HTTP request → CSRF → server-side authentication/authorization/scope/duty/classification/SoD → authoritative command composition → idempotency → unified temporary-exit application service → validation → document preparation → approval → issuance → artifact handoff → single-use controlled download grant → download → operational exit → handover → return → duty completion → close → critical transaction → persistent adapter → audit/outbox intent → commit → post-commit provider.

## Evidence gate

The regression gate is synthetic and fail-closed. Required safety conditions remain `APP_ENV=test`, `AI_ENABLED=false`, and `MIGRATION_FREEZE=true`. Evidence includes a SHA-256 digest of test output and may not be promoted to certification merely because tests exist.

## Current decision

**BLOCKED FOR PRODUCTION / GOVERNANCE DECISION REQUIRED.** The implementation boundary is increasingly complete, but PostgreSQL production integration remains intentionally unopened. No migration or production write has been executed.

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

P10.101 onward: reconcile the authenticated command boundary with the existing HTTP gateway and unified temporary-exit service; align the artifact grant with the existing persistent-grant transaction contract; strengthen audit-chain verification against evidence manifests; then prepare a controlled PostgreSQL adapter specification without executing schema changes while migration freeze remains TRUE.
