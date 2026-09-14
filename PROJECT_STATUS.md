# MTA DETENI — Project Status

**Version:** P10.3 Movement Ledger / Headcount  
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
- P10.3 append-only movement ledger and deterministic headcount projection foundation.

## P10.3 executable flow

`Request Context → Authorization → Movement Validation → Append-only Ledger → Transaction → Audit → Outbox → Headcount Projection`

Movement records require explicit detainee, actor, scope, request and correlation context, source/target location, and an eligible active lifecycle state. Ledger entries are sequenced and request-idempotent.

## P10.3 controls

- movement permission reuses `deteni.placement.transfer`;
- deny-by-default authorization remains mandatory;
- invalid lifecycle state and missing movement context are rejected before append;
- movement history is append-only rather than silently overwritten;
- replay does not duplicate ledger history;
- headcount is derived from latest known placement per detainee;
- successful movement records domain state, audit, outbox and idempotency evidence.

## Certification blockers

The following remain intentionally `NOT_RUN` or externally unverified:

- real PostgreSQL transaction/isolation/concurrency behavior;
- real capacity concurrency enforcement;
- real storage provider security;
- real external provider idempotency/retry behavior;
- runtime HTTP/RBAC integration;
- production deployment evidence;
- final database contract reconciliation;
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

P10.4 — Operational Identity / Barcode-QR Boundary, without weakening the migration freeze or certification gates.
