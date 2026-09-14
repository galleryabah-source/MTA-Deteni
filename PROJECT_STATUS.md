# MTA DETENI — Project Status

**Version:** P10.10 Persistent Grant / Revocation Transaction Boundary  
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
- P10.10 persistent artifact-grant repository contract, parameterized atomic consume/revoke operations, and fail-closed affected-row enforcement.

## P10.10 executable contract

`ISSUED Artifact → Persistent Grant Insert → Commit (Audit + Outbox) → Post-commit Provider Handoff → Atomic ACTIVE/Unexpired/Actor/Scope/Object Consume → Single-use Download`

P10.10 replaces the purely in-memory persistence assumption with an explicit repository boundary. Grant creation uses parameterized PostgreSQL INSERT semantics. Consumption is a single conditional UPDATE requiring ACTIVE status, non-expiry, actor binding, scope binding and object binding; exactly one affected row is required. Revocation is likewise a single conditional UPDATE requiring ACTIVE status and actor/scope binding. Zero affected rows fail closed.

The repository adapter does not execute DDL or create schema. It is intentionally compatible with the active Migration Freeze. No production database schema, grant table, or migration was created by this checkpoint.

## P10.10 controls

- parameterized SQL only; no string interpolation of request values;
- single-row conditional state transitions;
- ACTIVE-only consumption and revocation;
- consumption requires unexpired grant;
- actor, scope and object binding enforced in the database predicate;
- exactly-one-row transition required; zero/multiple rows fail closed;
- provider/network storage calls remain post-commit outbox work;
- AI remains OFF;
- tests use synthetic fixtures and a database-client test double only;
- no real detainee data, production files, credentials or secrets.

## Required MVP document outputs

- `TEMPORARY_EXIT_PERMISSION` — Surat Izin Keluar Sementara;
- `ESCORT_ASSIGNMENT_LETTER` — Surat Tugas Pengawalan.

Artifacts remain downstream of authorization, document lifecycle, approval/SoD, template governance, checksum integrity and private storage controls. The runtime distribution boundary cannot authorize issuance by itself.

## Certification blockers

The following remain intentionally `NOT_RUN` or externally unverified:

- real PostgreSQL schema and migration under an explicitly approved migration window;
- real PostgreSQL transaction/isolation/concurrency behavior;
- real capacity concurrency enforcement;
- persistent download-grant storage against the approved schema;
- real storage provider security and private bucket policy;
- persistent database-backed identity mapping;
- real scanner/device policy integration;
- real external provider idempotency/retry behavior;
- runtime HTTP middleware/RBAC integration;
- production deployment evidence;
- final database contract reconciliation;
- binary `.docx` renderer/storage integration against approved production templates;
- real template governance and signature infrastructure;
- end-to-end audit/outbox persistence for artifact distribution;
- CI step-level evidence where GitHub currently exposes failed jobs without accessible steps/logs.

CI evidence must still be independently observed before certification. A completed CI failure without accessible step evidence is not converted to PASS.

## Safety rules

- no schema migration;
- no production database connection;
- no real detainee data;
- no production credentials or secrets;
- AI remains OFF;
- domain tests use synthetic fixtures only;
- certification is fail-closed.

## Next checkpoint

P10.11 — Persistent Grant Integration Readiness: reconcile the repository contract with the approved database model, transaction boundary, audit/outbox event contract, RLS/RBAC policy surface, and production storage-provider handoff prerequisites. Migration remains frozen until explicit approval and observable integration evidence are available.
