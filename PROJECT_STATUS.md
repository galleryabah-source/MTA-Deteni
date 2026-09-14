# MTA DETENI — Project Status

**Version:** P10.22 CI Evidence Hardening & Runtime Regression Gate  
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
- P10.21 executable synthetic runtime integration contract tests.

## P10.22 implementation

The runtime workflow now has an explicit deterministic regression gate. It enforces the synthetic safety contract (`APP_ENV=test`, `AI_ENABLED=false`, `MIGRATION_FREEZE=true`), verifies all required regression test files, runs the complete P10 synthetic suite, classifies the outcome as PASS/FAIL/BLOCKED, and emits sanitized operational evidence under `artifacts/p10-runtime/`.

The workflow uploads the evidence directory with `if: always()` so failures in the regression command do not erase diagnostic evidence. A manual `workflow_dispatch` trigger is available without changing safety controls.

An obsolete P10.19 placeholder file was removed. No migration, production database operation, AI activation, real detainee data, credential, or production provider action is part of this checkpoint.

## Current verification state

The latest GitHub Actions runs for the previous P10 runtime commit returned completed failures with zero exposed steps and log retrieval `BlobNotFound`. This is insufficient evidence to classify the application suite as PASS or FAIL. Reruns were requested, but independently observable step-level evidence remains a certification requirement.

P10.22 therefore remains **IMPLEMENTED — AWAITING OBSERVABLE CI EVIDENCE** rather than certified.

## Certification blockers

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
- provider retry/dead-letter/idempotency evidence;
- independently observable GitHub Actions evidence.

## Safety rules

- no schema migration;
- no production database connection;
- no real detainee data;
- no production credentials or secrets;
- AI remains OFF;
- synthetic fixtures/test doubles only;
- certification is fail-closed.

## Next checkpoint

P10.23 — Runtime Evidence Integrity & Release-Gate Consolidation: verify that CI evidence itself is complete, sanitized, attributable to the tested commit, and cannot be mistaken for production certification.
