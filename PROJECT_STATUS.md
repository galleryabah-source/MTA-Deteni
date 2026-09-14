# MTA DETENI — Project Status

**Version:** P10.20 Document Output Runtime Integration Contract  
**Branch:** `phase10.14-database-verification-package`  
**Certification:** NOT CERTIFIED  
**Migration Freeze:** TRUE  
**AI:** OFF  
**Data Boundary:** SYNTHETIC ONLY

## Completed checkpoints

- P9 kernel configuration and fail-closed environment contract;
- deny-by-default authorization with scope, duty, classification and operational-bypass controls;
- canonical audit hash-chain foundation;
- transactional command boundary with rollback model;
- idempotency and outbox lifecycle/lease model;
- private storage boundary;
- observability/redaction foundation;
- deterministic test harness;
- CI quality-gate foundation;
- P9.11 concurrency/failure/security checkpoint coverage;
- P9.13 deterministic certification evidence evaluator;
- P9 kernel invariant audit;
- P10.1 temporary-exit runtime/domain integration foundation;
- P10.2 placement domain boundary and synthetic integration coverage;
- P10.3 append-only movement ledger and deterministic headcount projection foundation;
- P10.4 operational identity / barcode-QR security boundary;
- P10.5 document / exit authorization binding and lifecycle foundation;
- P10.6 deterministic template manifest and field-validation boundary;
- P10.7 deterministic DOCX artifact renderer and checksum boundary;
- P10.8 controlled artifact handoff boundary;
- P10.9 runtime artifact distribution security boundary;
- P10.10 persistent artifact-grant repository contract, parameterized atomic consume/revoke operations, and fail-closed affected-row enforcement;
- P10.11 persistent grant integration readiness contract and transaction orchestration boundary;
- P10.12 database integration package: proposed migration, RLS contract, PostgreSQL concurrency test plan, rollback plan, and static package contract test;
- P10.13 identity/scope RLS finalization contract and approved database integration execution gate;
- P10.14 database integration verification package and executable verification matrix;
- P10.15 controlled database execution harness contract and fail-closed execution test;
- P10.16 database role/RLS verification specification and synthetic isolation matrix;
- P10.17 persistent artifact-grant end-to-end synthetic runtime verification contract;
- P10.18 document output operationalization package;
- P10.19 DOCX artifact contract test and synthetic output fixture package;
- P10.20 document output runtime integration contract.

## P10.20 preparation

`Authorize → Validate State/Template → Render DOCX → SHA-256 → Artifact Binding → Lifecycle/SoD → Audit/Outbox → Commit → Persistent Grant → Secure Consume`

P10.20 binds the existing renderer, document lifecycle, private artifact storage and persistent grant boundary into one deterministic orchestration contract. Unknown document kinds, arbitrary template paths, incomplete authorization, invalid lifecycle state, missing approval/SoD, checksum mismatch and incomplete grant context fail closed.

External provider/network activity remains strictly after transaction commit. Idempotency prevents duplicate official artifacts or grants and rejects conflicting payloads under the same idempotency identity.

## Certification blockers

- explicit governance approval to lift Migration Freeze;
- controlled migration execution and schema verification;
- final approved actor-to-identity and scope RLS policy;
- real PostgreSQL isolation/concurrency evidence;
- persistent grant integration against deployed schema;
- end-to-end persistent audit/outbox evidence;
- real private object storage/provider security;
- runtime HTTP middleware/RBAC integration;
- production deployment evidence;
- approved production DOCX templates/signature infrastructure;
- scanner/device integration;
- provider retry/dead-letter/idempotency evidence;
- GitHub Actions step-level evidence.

## Safety rules

- no schema migration;
- no production database connection;
- no real detainee data;
- no production credentials or secrets;
- AI remains OFF;
- synthetic fixtures/test doubles only;
- certification is fail-closed.

## Next checkpoint

P10.21 — Runtime Integration Contract Tests: implement executable synthetic orchestration tests for the complete document-output path and verify transaction, idempotency, lifecycle, grant and provider-order invariants.
