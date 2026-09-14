# MTA DETENI — Project Status

**Version:** P10.4 Operational Identity / Barcode-QR Boundary  
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
- P10.4 opaque barcode/QR operational identity boundary and synthetic integration coverage.

## P10.4 executable flow

`Scanner Input → Opaque Identity Normalization → Identity Resolution → Authorization → Transaction → Audit → Outbox`

The scanned identity is treated as untrusted input. Resolution identifies an operational record only; it does not grant authorization.

## P10.4 controls

- BARCODE and QR are explicit identity types;
- scanned tokens are opaque and must not encode direct detainee identifiers;
- malformed and unknown identities fail closed;
- inactive identities cannot proceed as operational actions;
- authorization remains independent and deny-by-default;
- successful scans cross the transactional boundary;
- audit and outbox are critical side effects;
- idempotent replay does not duplicate critical side effects;
- synthetic fixtures only.

## Certification blockers

The following remain intentionally `NOT_RUN` or externally unverified:

- real PostgreSQL transaction/isolation/concurrency behavior;
- real capacity concurrency enforcement;
- PostgreSQL-backed identity registry and uniqueness/revocation semantics;
- physical barcode/QR issuance, replacement and rotation policy;
- scanner/device trust model;
- real storage provider security;
- real external provider idempotency/retry behavior;
- runtime HTTP/RBAC integration;
- production deployment evidence;
- final database contract reconciliation;
- CI step-level evidence where GitHub exposes a failed run without accessible job logs.

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

P10.5 — Temporary Exit Approval / Execution Boundary, preparing the mandatory DOCX output contract without bypassing authorization or migration gates.
