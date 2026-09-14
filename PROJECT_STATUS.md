# MTA DETENI — Project Status

**Version:** P10.5 Temporary Exit Approval / Execution Boundary  
**Branch:** `phase10.4`  
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
- P10.4 opaque barcode/QR operational identity boundary and synthetic integration coverage;
- P10.5 temporary-exit approval boundary and synthetic regression coverage.

## P10.5 executable flow

`EXIT_REQUESTED → Validation → Authorization → Approval → EXIT_APPROVED → Audit → Outbox`

Approval requires explicit context, a controlled purpose, eligible request state, explicit approver identity, and separation of duties between requester and approver.

## P10.5 controls

- approval is only valid for `EXIT_REQUESTED`;
- approver cannot be the requesting actor;
- purpose uses an explicit controlled vocabulary;
- authorization remains independent and deny-by-default;
- unauthorized approval creates no domain/audit/outbox side effects;
- successful approval is atomic across domain state, audit, outbox and idempotency;
- replay does not duplicate critical side effects;
- different payload under the same idempotency key conflicts;
- synthetic fixtures only.

## Certification blockers

- real PostgreSQL transaction/isolation/concurrency behavior;
- real capacity concurrency enforcement;
- PostgreSQL-backed identity registry and uniqueness/revocation semantics;
- approved authority matrix and SOP validation for actual approver roles;
- final DOCX document contract, template/version/numbering/signature controls;
- physical barcode/QR issuance and device trust policy;
- real storage/provider behavior;
- runtime HTTP/RBAC integration;
- production deployment evidence;
- final database contract reconciliation;
- CI step-level evidence where GitHub exposes failures without accessible job logs.

A completed CI failure without accessible step evidence is not converted to PASS.

## Safety rules

- no schema migration;
- no production database connection;
- no real detainee data;
- no production credentials or secrets;
- AI remains OFF;
- domain tests use synthetic fixtures only;
- certification is fail-closed.

## Next checkpoint

P10.6 — Document Contract / DOCX Generation Boundary for Surat Izin Keluar Sementara and Surat Tugas Pengawalan.
