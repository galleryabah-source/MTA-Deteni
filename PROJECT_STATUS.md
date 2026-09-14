# MTA DETENI — Project Status

**Version:** P10.34 Security Certification Readiness  
**Branch:** `phase10.14-database-verification-package`  
**Certification:** NOT CERTIFIED  
**Migration Freeze:** TRUE  
**AI:** OFF  
**Data Boundary:** SYNTHETIC ONLY

## Completed checkpoints

- P9 kernel configuration, authorization, audit, transaction, idempotency, outbox, storage, observability and deterministic test foundations;
- P10.1–P10.5 operational domain, placement, movement ledger, operational identity, document authorization and lifecycle foundations;
- P10.6 deterministic template manifest and field-validation boundary;
- P10.7 deterministic DOCX artifact renderer and checksum boundary;
- P10.8–P10.9 artifact handoff and secure distribution boundaries;
- P10.10 persistent artifact-grant repository contract and atomic consume/revoke operations;
- P10.11 persistent grant transaction orchestration boundary;
- P10.12 database integration package, RLS contract, concurrency plan and rollback plan;
- P10.13 identity/scope RLS finalization and approved database integration gate;
- P10.14 database integration verification package;
- P10.15 controlled database execution harness;
- P10.16 database role/RLS verification specification;
- P10.17 persistent artifact-grant synthetic E2E verification contract;
- P10.18 document output operationalization package;
- P10.19 DOCX artifact contract tests and synthetic output fixtures;
- P10.20 document output runtime integration contract;
- P10.21 executable synthetic runtime integration contract tests;
- P10.22 deterministic CI evidence hardening and runtime regression gate;
- P10.23 runtime evidence integrity and release-gate consolidation;
- P10.24 repository release-readiness and controlled-runtime safety contract;
- P10.25 controlled runtime boundary preparation;
- P10.26 runtime enforcement matrix;
- P10.27 authorization enforcement adapter contract;
- P10.28 runtime RBAC negative-test matrix;
- P10.29 document API boundary contract;
- P10.30 document API synthetic contract test specification;
- P10.31 audit/correlation release contract;
- P10.32 critical transaction release matrix;
- P10.33 security boundary finalization;
- P10.34 security certification readiness.

## P10.25–P10.34 consolidated architecture

The runtime boundary is specified as one fail-closed path: HTTP request → authentication → authorization → scope/duty/classification/SoD enforcement → validation → domain command → critical transaction → audit → outbox → post-commit provider. Document generation and artifact download remain bound to immutable template/artifact identity and persistent single-use grants. Administrative RBAC authority remains separate from operational authority.

P10.25–P10.34 are contract/readiness checkpoints. They do not represent production activation. No migration, production database operation, AI activation, real detainee data, credentials, or production provider action is included.

## Certification blockers

- fresh independently observable GitHub Actions step-level evidence;
- explicit governance approval to lift Migration Freeze;
- controlled migration execution and schema verification;
- final approved actor-to-identity and scope RLS policy;
- real PostgreSQL isolation/concurrency evidence;
- persistent grant integration against deployed schema;
- end-to-end persistent audit/outbox evidence;
- real private object storage/provider security;
- runtime HTTP middleware/RBAC integration;
- production deployment evidence;
- approved production DOCX templates/signature infrastructure;
- scanner/device integration;
- provider retry/dead-letter/idempotency evidence.

## Safety rules

- no schema migration;
- no production database connection;
- no real detainee data;
- no production credentials or secrets;
- AI remains OFF;
- synthetic fixtures/test doubles only;
- certification is fail-closed.

## Next checkpoint

P10.35 — Release Candidate Hardening: consolidate the complete runtime/document/security contract into a release-candidate gate, then re-verify observable CI before any governance decision about Migration Freeze.
