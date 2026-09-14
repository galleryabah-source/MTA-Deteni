# MTA DETENI — Project Status

**Version:** P10.1 Runtime / Domain Integration Foundation  
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
- P10.1 first runtime/domain integration foundation for temporary-exit command.

## P10.1 executable flow

`Request Context → Authorization → Domain Command → Transaction → Audit → Outbox`

The first command boundary currently models a synthetic temporary-exit request and transitions the detainee aggregate from `ACTIVE` to `EXIT_REQUESTED`.

## Certification blockers

The following remain intentionally `NOT_RUN` or externally unverified:

- real PostgreSQL transaction/isolation/concurrency behavior;
- real storage provider security;
- real external provider idempotency/retry behavior;
- runtime HTTP/RBAC integration;
- production deployment evidence;
- final database contract reconciliation.

CI has produced a completed failure run, but the available GitHub API surface does not expose its step logs; therefore the failure is not converted to a guessed root cause or PASS.

## Safety rules

- no schema migration;
- no production database connection;
- no real detainee data;
- no production credentials or secrets;
- AI remains OFF;
- domain tests use synthetic fixtures only;
- certification is fail-closed.

## Next checkpoint

P10.2 — Placement domain boundary, reusing the same authorization, transaction, audit, idempotency and outbox invariants. Database integration remains gated behind contract reconciliation and explicit evidence.
