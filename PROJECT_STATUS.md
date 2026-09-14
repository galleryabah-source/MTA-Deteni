# MTA DETENI — Project Status

**Version:** P10.24 Repository Release Readiness & Controlled Runtime Boundary  
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
- P10.24 repository release-readiness and controlled-runtime safety contract.

## P10.24 implementation

The repository now has an executable release-readiness contract test covering the presence of the runtime/evidence gates, required implementation documentation, removal of the obsolete placeholder, immutable synthetic CI settings, diagnostic preservation, manual dispatch, and explicit prohibition of migration commands or an unsafe freeze setting in the P10 workflow.

The P10 regression gate includes this release-readiness test in its controlled synthetic suite. Evidence remains commit-bound and SHA-256 self-consistent through the P10.23 integrity gate.

No migration, production database operation, AI activation, real detainee data, credential, or production provider action is part of this checkpoint.

## Current verification state

GitHub Actions previously returned failures with zero exposed steps and `BlobNotFound` log retrieval. New commits have been structured to produce deterministic, commit-attributable evidence and upload it even when the regression command fails. Certification is still not claimed until a fresh workflow run exposes valid step-level evidence and the application suite itself is classified.

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

P10.25 — Controlled Runtime Boundary Preparation: formalize the application HTTP/runtime contract, authorization enforcement points, and production-boundary test matrix without activating production infrastructure.
