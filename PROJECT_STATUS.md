# MTA DETENI — Project Status

**Version:** P10.21 Runtime Integration Contract Tests  
**Branch:** `phase10.18-document-output-operationalization`  
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

## P10.21 verification scope

The executable synthetic suite now covers both required Word outputs (`TEMPORARY_EXIT_PERMISSION` and `ESCORT_ASSIGNMENT_LETTER`) and verifies deterministic DOCX generation, SHA-256 integrity, lifecycle/SoD, authorization-bound handoff, single-use consume, transaction rollback, provider isolation and idempotency replay/conflict behavior.

The P10 workflow now executes only files present in the repository, includes the P10.18 branch in push triggers, explicitly verifies required test files before execution, and uploads test diagnostics for observable evidence.

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

P10.22 — CI Evidence Hardening & Runtime Regression Gate: consume observable workflow results, preserve diagnostics, and add a deterministic release gate without lifting Migration Freeze or enabling AI.
