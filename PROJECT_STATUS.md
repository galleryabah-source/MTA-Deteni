# MTA DETENI — Project Status

**Version:** P10.14 Database Integration Verification Package  
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
- P10.14 database integration verification package and executable verification matrix.

## P10.14 preparation

`Artifact Integrity → Schema Contract → Privilege/RLS Verification → Identity/Scope Isolation → Repository Verification → Transaction Atomicity → Concurrency → Rollback → Evidence Completeness`

P10.14 defines V1–V16 verification cases covering database identity, migration checksum, schema constraints, RLS/privileges, actor/scope/object isolation, expiry/replay, concurrency, revoke races, transaction rollback, provider isolation and evidence completeness. Execution remains blocked while `MIGRATION_FREEZE=TRUE`.

A safety-gated result is explicitly `SKIPPED_BY_SAFETY_GATE`, never PASS. No production database operation or DDL has been executed by this checkpoint.

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

Latest observed P10 workflow run #115 failed with a job exposing zero steps; its log endpoint returned BlobNotFound. Therefore CI remains an infrastructure/evidence blocker, not application PASS/FAIL evidence.

## Safety rules

- no schema migration;
- no production database connection;
- no real detainee data;
- no production credentials or secrets;
- AI remains OFF;
- synthetic fixtures/test doubles only;
- certification is fail-closed.

## Next checkpoint

P10.15 — Controlled Database Execution Harness: prepare a fail-closed execution runner and evidence schema. It may only execute after explicit Migration Freeze lift and approved target verification.
