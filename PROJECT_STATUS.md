# MTA DETENI — Project Status

**Version:** P10.7 DOCX Renderer / Artifact Integrity Boundary  
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
- P10.7 deterministic DOCX artifact renderer and checksum boundary.

## P10.7 executable flow

`Approved Manifest → Fail-Closed Field Validation → Deterministic OOXML Package → SHA-256 → Artifact Identity`

The P10.7 adapter produces a dependency-free OOXML `.docx` package from the governed manifest/data contract. ZIP metadata is fixed for reproducibility, field values are XML-escaped, and artifact identity is derived from the SHA-256 digest.

This is a synthetic/reference renderer boundary only. It does not embed an official production template and does not claim final government template fidelity.

## Required MVP document outputs

- `TEMPORARY_EXIT_PERMISSION` — Surat Izin Keluar Sementara;
- `ESCORT_ASSIGNMENT_LETTER` — Surat Tugas Pengawalan.

The renderer contract targets Word `.docx` artifacts from approved templates. Artifact issuance remains downstream of authorization, lifecycle approval, integrity verification and private storage controls.

## P10.7 controls

- versioned template manifest;
- unique, explicitly typed fields;
- allowed field sources limited to authorization/document/system;
- required-field validation;
- deterministic field ordering/canonicalization;
- deterministic DOCX package generation;
- XML escaping against markup injection;
- SHA-256 checksum and digest-derived artifact identity;
- no arbitrary client field source;
- existing authorization, scope, classification and SoD controls remain mandatory;
- AI remains OFF and is not a rendering dependency.

## Certification blockers

The following remain intentionally `NOT_RUN` or externally unverified:

- real PostgreSQL transaction/isolation/concurrency behavior;
- real capacity concurrency enforcement;
- real storage provider security;
- persistent revocation/database-backed identity mapping;
- real scanner/device policy integration;
- real external provider idempotency/retry behavior;
- runtime HTTP/RBAC integration;
- production deployment evidence;
- final database contract reconciliation;
- binary `.docx` renderer/storage integration against approved production templates;
- real template governance and signature infrastructure;
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

P10.8 — Controlled Artifact Handoff / Private Download Boundary: bind generated artifact identity to lifecycle state, private storage object identity, scoped access, single-use download grant, revocation and audit/outbox handoff without schema changes.
