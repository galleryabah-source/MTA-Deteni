# MTA DETENI — Project Status

**Version:** P10.76 Persistence & Release Gates  
**Branch:** `phase10.14-database-verification-package`  
**Certification:** NOT CERTIFIED  
**Migration Freeze:** TRUE  
**AI:** OFF  
**Data Boundary:** SYNTHETIC ONLY

## Completed checkpoints

P9 kernel foundations; P10.1–P10.13 operational/domain/database-contract foundations; P10.14–P10.17 controlled database verification packages; P10.18–P10.21 document-output operationalization and runtime integration contracts; P10.22–P10.24 CI evidence, release-readiness and safety consolidation; P10.25–P10.34 runtime, authorization, document API, audit, transaction and security certification-readiness contracts; P10.35–P10.48 evidence and release hardening; P10.49–P10.54 controlled temporary-exit vertical slice and operational execution boundaries; P10.55 explicit operational state machine; P10.56 unified operational read model; P10.57 persistence repository contract; P10.58 unified temporary-exit application service; P10.59 transactional rollback boundary; P10.60 vertical-slice regression gate; P10.61–P10.68 command/runtime boundary contracts; P10.69–P10.76 persistence and release gates.

## P10.69–P10.76 technical actions

- P10.69: persistence adapter contract requires transaction, idempotency, audit, outbox and scope enforcement capabilities.
- P10.70: integrity capabilities are mandatory and fail closed when absent.
- P10.71: provider/network execution is blocked until the persistence transaction commits.
- P10.72: schema-changing operations remain blocked while Migration Freeze is TRUE.
- P10.73: scope enforcement remains server-authoritative at the persistence boundary.
- P10.74: provider calls are deliberately outside the persistence transaction contract and must use post-commit dispatch.
- P10.75: release safety remains synthetic-only with production data, repository secrets and AI runtime activation prohibited.
- P10.76: controlled database execution is not eligible until the persistence contract is validated.

The runtime regression gate now includes P10.61–P10.68 and P10.69–P10.76 tests. These are contract/readiness tests; they do not certify PostgreSQL, RLS, production runtime, provider delivery or governance approval.

## Integrated architecture

Authenticated HTTP request → CSRF → server-side authorization/scope/duty/classification/SoD → command identity/idempotency → unified temporary-exit application service → validation → document preparation → approval → issuance → artifact handoff → controlled download → operational exit → handover → return → duty completion → close → critical transaction → audit/outbox → commit → post-commit provider.

## Current decision

**BLOCKED FOR PRODUCTION / GOVERNANCE DECISION REQUIRED.** Certification remains fail-closed. GitHub PR #7 remains the sole controlled implementation PR; no merge is performed. The implementation branch is intentionally separate from `main`.

## Safety

- Migration Freeze TRUE.
- No schema migration executed by P10.69–P10.76.
- No production database operation.
- AI OFF.
- Synthetic fixtures/test doubles only.
- No provider activation.
- No real detainee data/secrets.
- `main` remains untouched by implementation commits.

## Next gates

P10.77+: persistent adapter implementation against the approved database package, controlled transaction/idempotency/audit/outbox integration, authenticated operational endpoint matrix, UI workflow state integration, and independent CI evidence. These remain blocked from live database execution until the migration-freeze/governance gate is explicitly cleared.
