# MTA DETENI — Project Status

**Version:** P10.12 Database Integration Package  
**Branch:** `phase10.10-persistent-grant-boundary`  
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
- P10.12 database integration package: proposed migration, RLS contract, PostgreSQL concurrency test plan, rollback plan, and static package contract test.

## P10.12 executable preparation

`Schema Review → Migration Approval → Controlled Migration Window → Schema Verification → Repository Integration → RLS Verification → PostgreSQL Concurrency Test → Rollback Drill → Evidence Review`

The proposed migration creates `artifact_download_grants` with lifecycle constraints, checksum validation, expiry ordering, timestamps, indexes, RLS enabled, and explicit revocation of anonymous/authenticated/public table privileges. It is a review artifact only and has not been executed.

The RLS contract deliberately avoids permissive placeholder policies. Final actor-to-identity and scope mapping must be approved before direct authenticated access is enabled. Server-side repository access remains subject to the application Authorization Control Plane.

The concurrency plan requires independent PostgreSQL connections and observable row counts proving that only one concurrent consume can succeed. The rollback plan requires schema/privilege/RLS evidence and protects audit/retention requirements from destructive rollback.

## Required MVP document outputs

- `TEMPORARY_EXIT_PERMISSION` — Surat Izin Keluar Sementara;
- `ESCORT_ASSIGNMENT_LETTER` — Surat Tugas Pengawalan.

Artifacts remain downstream of authorization, document lifecycle, approval/SoD, template governance, checksum integrity and private storage controls.

## Certification blockers

- migration execution and schema verification;
- real PostgreSQL isolation/concurrency evidence;
- final actor-to-identity and scope RLS policy;
- persistent grant integration against deployed schema;
- end-to-end persistent audit/outbox evidence;
- real private object storage/provider security;
- runtime HTTP middleware/RBAC integration;
- production deployment evidence;
- approved production DOCX templates/signature infrastructure;
- scanner/device integration;
- provider retry/dead-letter/idempotency evidence;
- GitHub Actions step-level evidence.

The latest P10 workflow still fails before exposing executable steps; the job reports `failure` with no observable steps/logs. This remains an infrastructure/evidence blocker, not application PASS/FAIL evidence.

## Safety rules

- no schema migration;
- no production database connection;
- no real detainee data;
- no production credentials or secrets;
- AI remains OFF;
- synthetic fixtures/test doubles only;
- certification is fail-closed.

## Next checkpoint

P10.13 — Approved Database Integration Execution Gate: verify governance approval, finalize identity/scope RLS policy, execute the migration only when the Migration Freeze is explicitly lifted, then run real PostgreSQL integration/concurrency/rollback evidence.
