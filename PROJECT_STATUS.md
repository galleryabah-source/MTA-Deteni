# MTA DETENI — Project Status

**Version:** P10.9 Runtime HTTP/RBAC Artifact Distribution Boundary  
**Branch:** `phase9-kernel-implementation`  
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
- P10.9 runtime artifact distribution security boundary.

## P10.9 executable flow

`Authenticated Request → Authorization → ISSUED/Artifact/Scope Validation → Critical Transaction (Audit + Outbox) → Commit → Outbox Worker → Storage Provider Grant → Single-use Download`

P10.9 binds the P10.8 grant contract to authenticated request context and deny-by-default authorization. Document state, artifact identity/checksum, scope and private-storage metadata are validated before the audit/outbox boundary. Provider/storage network calls are explicitly excluded from the critical transaction and are represented as post-commit outbox work.

This remains a synthetic/runtime adapter boundary. It does not claim production HTTP middleware, persistent grant storage, PostgreSQL concurrency, or production object-storage evidence.

## Required MVP document outputs

- `TEMPORARY_EXIT_PERMISSION` — Surat Izin Keluar Sementara;
- `ESCORT_ASSIGNMENT_LETTER` — Surat Tugas Pengawalan.

Artifacts remain downstream of authorization, document lifecycle, approval/SoD, template governance, checksum integrity and private storage controls. The runtime distribution boundary cannot authorize issuance by itself.

## P10.9 controls

- authenticated active session required;
- permission `deteni.document.artifact.download` required;
- scope, assignment/duty, classification and policy checks remain deny-by-default;
- document must already be `ISSUED`;
- artifact ID, SHA-256 and private object ID remain bound;
- storage object must be `AVAILABLE` and checksum must match;
- audit and outbox are transaction participants;
- provider/network storage calls are post-commit only;
- actor/scope-bound short-lived single-use grant;
- replay, wrong actor, wrong scope, invalid state and checksum mismatch fail closed;
- Super Admin operational bypass remains denied;
- no production storage credentials or real files;
- AI remains OFF and is not a distribution dependency.

## Certification blockers

The following remain intentionally `NOT_RUN` or externally unverified:

- real PostgreSQL transaction/isolation/concurrency behavior;
- real capacity concurrency enforcement;
- persistent download-grant storage and revocation;
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

P10.10 — Persistent Grant / Revocation Transaction Boundary: replace the in-memory P10.8 grant lifecycle with a database-backed transactional contract, including concurrency-safe single-use consumption and revocation, without lifting the migration freeze until the database contract is explicitly approved and integration evidence is available.
