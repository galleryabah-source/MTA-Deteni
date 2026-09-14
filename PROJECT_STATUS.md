# MTA DETENI — Project Status

**Version:** P10.8 Controlled Artifact Handoff / Private Download Boundary  
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
- P10.8 controlled artifact handoff boundary.

## P10.8 executable flow

`ISSUED Document → Artifact Binding → Scoped Download Grant → Expiry / Revocation → Single-use Consumption → Audit / Outbox Handoff`

The P10.8 boundary binds the document ID, artifact ID, artifact SHA-256 and private storage object identity into a scoped download grant. A grant is actor-bound, scope-bound, time-limited and single-use. Consumption changes the grant to `CONSUMED`; revocation changes it to `REVOKED`; replay, wrong actor, wrong scope, wrong object and expiry fail closed.

This remains a domain/test boundary. Persistence of grants, storage-provider execution and audit/outbox commit behavior remain downstream integration gates.

## Required MVP document outputs

- `TEMPORARY_EXIT_PERMISSION` — Surat Izin Keluar Sementara;
- `ESCORT_ASSIGNMENT_LETTER` — Surat Tugas Pengawalan.

The artifact handoff layer does not authorize issuance by itself. Existing authorization, document lifecycle, scope, classification and SoD controls remain prerequisites.

## P10.8 controls

- document must already be `ISSUED`;
- artifact ID and SHA-256 must be present;
- immutable private object identity binding;
- actor and scope binding;
- short-lived grant with explicit expiry;
- single-use consumption;
- explicit revocation;
- fail-closed replay protection;
- artifact/document/object identity consistency check;
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
- runtime HTTP/RBAC integration;
- production deployment evidence;
- final database contract reconciliation;
- binary `.docx` renderer/storage integration against approved production templates;
- real template governance and signature infrastructure;
- end-to-end audit/outbox persistence for artifact distribution;
- CI step-level evidence where GitHub currently exposes a failed run without accessible job logs.

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

P10.9 — Runtime HTTP/RBAC Artifact Distribution Boundary: connect the P10.8 grant contract to authenticated request context, deny-by-default authorization, private storage access and transactional audit/outbox orchestration without weakening existing security invariants.
