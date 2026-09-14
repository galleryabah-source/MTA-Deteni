# MTA DETENI — Project Status

**Version:** P10.4 Operational Identity / Barcode-QR Boundary  
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
- P10.4 operational identity / barcode-QR security boundary.

## P10.4 executable flow

`Request Context → Authorization → Identity Issue/Verify → Purpose Check → Lifecycle/Scope Checks → Domain Action`

The operational identity layer issues an opaque signed token suitable for barcode/QR presentation. The token does not contain direct detainee PII and does not itself grant authorization.

## P10.4 controls

- opaque subject reference;
- HMAC-SHA-256 integrity protection;
- constant-time signature verification;
- purpose binding;
- bounded expiry;
- future-issued timestamp rejection;
- nonce-based revocation hook;
- fail-closed signing-secret requirement;
- no PII embedded in the barcode/QR value;
- existing RBAC/ABAC, scope, duty, classification, lifecycle and SoD controls remain mandatory.

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

P10.5 — Document/Exit Authorization Binding, including the required Word document output lifecycle, without weakening the migration freeze or certification gates.
