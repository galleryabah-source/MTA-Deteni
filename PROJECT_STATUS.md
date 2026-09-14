# MTA DETENI — Project Status

**Version:** P10.11 Persistent Grant Integration Readiness  
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
- P10.11 persistent grant integration readiness contract and transaction orchestration boundary.

## P10.11 executable contract

`Authorization → ISSUED/Artifact Binding → BEGIN → Persistent Grant INSERT → Audit → Outbox → COMMIT → Worker Claim → Provider Call → Atomic Grant Consume → Completion Audit`

P10.11 reconciles the P10.10 repository with the existing document lifecycle, deny-by-default authorization, critical transaction, audit and outbox boundaries. Grant insertion, audit and outbox callbacks are explicitly orchestrated on the same transaction client. Provider/network operations remain outside this boundary and are permitted only after durable outbox claim and commit.

The future database model must bind grant identity, document/artifact/object identity, checksum, actor, scope, issuance/expiry and lifecycle state. Consumption and revocation remain atomic conditional updates with exactly-one-row success semantics.

## P10.11 controls

- application authorization remains authoritative;
- persistent grant cannot grant permission by itself;
- `ISSUED` document state remains mandatory;
- document/artifact/object/checksum binding remains mandatory;
- grant identity is opaque and contains no detainee PII;
- actor and scope are persisted and enforced in state transitions;
- expiry is enforced in the consume predicate;
- lifecycle is `ACTIVE → CONSUMED` or `ACTIVE → REVOKED`;
- grant insert + audit + outbox share one critical transaction client;
- provider/network calls are post-commit only;
- anonymous/public access to grants is prohibited by future database policy contract;
- AI remains OFF;
- no production data or secrets are used.

## Required MVP document outputs

- `TEMPORARY_EXIT_PERMISSION` — Surat Izin Keluar Sementara;
- `ESCORT_ASSIGNMENT_LETTER` — Surat Tugas Pengawalan.

Artifacts remain downstream of authorization, document lifecycle, approval/SoD, template governance, checksum integrity and private storage controls. The runtime distribution boundary cannot authorize issuance by itself.

## Certification blockers

The following remain intentionally `NOT_RUN` or externally unverified:

- real PostgreSQL schema/migration;
- real PostgreSQL isolation/concurrency testing;
- RLS enforcement against the approved identity/scope model;
- persistent grant storage against a deployed schema;
- real private object storage and provider security;
- persistent database-backed identity mapping;
- scanner/device integration;
- provider idempotency/retry/dead-letter behavior;
- runtime HTTP middleware/RBAC integration;
- production deployment evidence;
- approved production DOCX templates and signature infrastructure;
- end-to-end persistent audit/outbox evidence;
- GitHub Actions step-level evidence while recent jobs fail before exposing executable steps/logs.

CI failures with no observable steps remain infrastructure/evidence failures, not application PASS/FAIL evidence.

## Safety rules

- no schema migration;
- no production database connection;
- no real detainee data;
- no production credentials or secrets;
- AI remains OFF;
- domain/integration tests use synthetic fixtures and test doubles;
- certification is fail-closed.

## Next checkpoint

P10.12 — Database Integration Package: prepare the approved migration package, RLS policy contract, repository integration tests, PostgreSQL concurrency test plan, and rollback plan. Do not execute migration/DDL while the Migration Freeze remains TRUE.
