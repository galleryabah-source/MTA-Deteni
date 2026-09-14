# MTA DETENI — Project Status

**Version:** P10.13 Approved Database Integration Execution Gate  
**Branch:** `phase10.13-approved-db-integration-gate`  
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
- P10.13 identity/scope RLS finalization contract and approved database integration execution gate.

## P10.13 preparation

`Governance Approval → Environment Verification → Migration Checksum Verification → Controlled Migration → Schema Verification → RLS Deployment → Role Tests → Repository Integration → Concurrency Tests → Rollback Drill → Evidence Review`

P10.13 explicitly remains a preparation gate while `MIGRATION_FREEZE=TRUE`. The branch adds the authoritative identity/scope mapping contract, execution preconditions/hard stops, evidence requirements, and static contract coverage. No DDL or production database operation has been executed.

The identity contract requires authoritative actor and scope mapping, server-side trust boundaries, and fail-closed behavior for missing, inactive, revoked, ambiguous or client-mismatched identity/scope context. Direct browser grant writes remain prohibited.

## Required MVP document outputs

- `TEMPORARY_EXIT_PERMISSION` — Surat Izin Keluar Sementara;
- `ESCORT_ASSIGNMENT_LETTER` — Surat Tugas Pengawalan.

Artifacts remain downstream of authorization, document lifecycle, approval/SoD, template governance, checksum integrity and private storage controls.

## Certification blockers

- explicit governance approval to lift Migration Freeze;
- migration execution and schema verification;
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

The latest P10 workflow has historically failed before exposing executable steps. Until a run exposes step-level evidence, CI cannot be treated as application PASS/FAIL evidence.

## Safety rules

- no schema migration;
- no production database connection;
- no real detainee data;
- no production credentials or secrets;
- AI remains OFF;
- synthetic fixtures/test doubles only;
- certification is fail-closed.

## Next checkpoint

P10.14 — Database Integration Verification Package: prepare executable role/RLS verification, repository-to-schema integration tests, and evidence collection contracts. Actual migration execution remains blocked until the Migration Freeze is explicitly lifted.
