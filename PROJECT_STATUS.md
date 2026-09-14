# MTA DETENI — Project Status

**Version:** P10.2 Placement Domain Boundary  
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
- P10.2 placement domain boundary and synthetic integration coverage.

## P10.2 executable flow

`Request Context → Authorization → Placement Validation → Transaction → Audit → Outbox`

Placement transfer requires explicit detainee/placement context, target block and room, active state, capacity availability, actor/scope/request/correlation identifiers, and idempotency key.

## P10.2 controls

- placement permission is `deteni.placement.transfer`;
- deny-by-default authorization remains mandatory;
- invalid state and exhausted capacity are rejected before mutation;
- successful placement records domain state, audit, outbox and idempotency evidence;
- replay does not duplicate critical side effects;
- changed target under the same idempotency key produces conflict.

## Certification blockers

The following remain intentionally `NOT_RUN` or externally unverified:

- real PostgreSQL transaction/isolation/concurrency behavior;
- real capacity concurrency enforcement;
- real storage provider security;
- real external provider idempotency/retry behavior;
- runtime HTTP/RBAC integration;
- production deployment evidence;
- final database contract reconciliation.

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

P10.3 — Movement Ledger / Headcount domain boundary, reusing authorization, immutable event history, transaction, audit, idempotency and outbox invariants. Real database integration remains gated behind contract reconciliation and explicit evidence.
