# MTA DETENI — Project Status

**Version:** P10.15 Controlled Database Execution Harness  
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
- P10.15 controlled database execution harness contract and fail-closed execution test.

## P10.15 preparation

`Approval → Freeze Check → Target Identity → Migration Checksum → Applied-Version Check → Controlled Execution → Schema/RLS Verification → Synthetic Role Tests → Evidence → Release`

P10.15 defines a controlled execution boundary. The runner must stop before database execution when the migration freeze is active, approval is absent, target identity is missing/mismatched, migration checksum is unavailable/mismatched, RLS identity/scope contract is not approved, or evidence persistence is unavailable.

The harness does not accept client-provided SQL, arbitrary migration paths, arbitrary table names, arbitrary connection strings, wildcard targets or inferred production targets. Evidence is restricted to operational metadata and synthetic identifiers.

No DDL or database migration has been executed. `SKIPPED_BY_SAFETY_GATE` remains distinct from PASS.

## Required MVP document outputs

- `TEMPORARY_EXIT_PERMISSION` — Surat Izin Keluar Sementara;
- `ESCORT_ASSIGNMENT_LETTER` — Surat Tugas Pengawalan.

Artifacts remain downstream of authorization, document lifecycle, approval/SoD, template governance, checksum integrity and private storage controls.

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

P10.16 — Database Role/RLS Verification Specification: prepare the synthetic role matrix, identity/scope fixtures and executable post-migration verification contract. Actual execution remains blocked until the Migration Freeze is explicitly lifted.
