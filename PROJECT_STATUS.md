# MTA DETENI — Project Status

**Version:** P10.60 Unified Temporary-Exit Application Boundary  
**Branch:** `phase10.14-database-verification-package`  
**Certification:** NOT CERTIFIED  
**Migration Freeze:** TRUE  
**AI:** OFF  
**Data Boundary:** SYNTHETIC ONLY

## Completed checkpoints

P9 kernel foundations; P10.1–P10.13 operational/domain/database-contract foundations; P10.14–P10.17 controlled database verification packages; P10.18–P10.21 document-output operationalization and runtime integration contracts; P10.22–P10.24 CI evidence, release-readiness and safety consolidation; P10.25–P10.34 runtime, authorization, document API, audit, transaction and security certification-readiness contracts; P10.35 release-candidate hardening; P10.36 operational scenario and failure-injection matrix; P10.37 evidence decision record; P10.38 production-readiness traceability; P10.39 final pre-governance gate; P10.40 final pre-governance release manifest; P10.41 controlled governance decision packet; P10.42 controlled PostgreSQL/RLS execution runbook; P10.43 post-freeze verification evidence contract; P10.44 production cutover/rollback gate; P10.45 CI evidence and dependency transport hardening; P10.46 dependency reproducibility/lockfile gate; P10.47 CI transport diagnostic and evidence manifest; P10.48 reviewed-lockfile transport integrity; P10.49 controlled temporary-exit vertical slice contract; P10.50 fail-closed HTTP command gateway boundary; P10.51 document issuance SoD orchestration; P10.52 temporary-exit timeline read model; P10.53 integrated temporary-exit workflow; P10.54 operational temporary-exit execution/return boundary; P10.55 explicit operational state machine; P10.56 unified operational read model; P10.57 persistence repository contract; P10.58 unified temporary-exit application service; P10.59 transactional service rollback boundary; P10.60 vertical-slice regression gate.

## P10.55–P10.60 technical actions

P10.55 defines an explicit application operational state machine: READY → EXIT_REQUESTED → HANDOVER_RECORDED → RETURN_RECORDED → DUTY_COMPLETED → CLOSED. Invalid transitions are rejected fail-closed. This state is deliberately distinct from the existing detainee lifecycle state so the application does not silently redefine domain semantics.

P10.56 provides a single read model for request identity, detainee reference, scope, correlation, operational state, document/artifact summary and append-only timeline. It is read-only at the application boundary.

P10.57 defines the persistence adapter contract required before a real database implementation can be connected: lookup, create/update, timeline persistence, document/artifact persistence and transaction boundary.

P10.58 composes request, execute-exit, return, duty-completion and close commands behind one application service. The implementation remains adapter-neutral and synthetic; it does not imply that PostgreSQL persistence is already deployed.

P10.59 adds a transactional rollback contract test using a synthetic repository. A failed command must leave the previous state intact.

P10.60 places P10.55–P10.59 into the deterministic regression gate. The gate now enumerates 51 required test files. The count is a test-file contract, not a claim that CI has independently executed successfully.

## Integrated architecture

HTTP request → authenticated server session → CSRF protection for mutation → server-side authorization → scope/duty/classification/SoD → validation → temporary-exit application service → document preparation → approval → issuance → artifact handoff → controlled download → operational exit → handover → return → duty completion → close → critical transaction/audit/outbox → commit → post-commit provider.

The canonical temporary-exit workflow remains REQUEST → VALIDATE → AUTHORIZE → GENERATE_EXIT_DOCUMENT → ASSIGN_ESCORT → APPROVE_DOCUMENT → ISSUE_DOCUMENT → GRANT_DOWNLOAD → DOWNLOAD → EXECUTE_EXIT → RETURN → CLOSE. Operational duty completion is represented as an application state transition after RETURN rather than inventing a new canonical vertical-slice step.

The current implementation is a synthetic application-layer vertical slice. It does not claim persistent PostgreSQL execution, production HTTP deployment, approved production DOCX templates, external provider activation, or real detainee data. Document generation remains deterministic and bound to immutable template/version/hash. Artifact handoff remains actor/scope/object/expiry-bound and single-use. Administrative RBAC authority remains separate from operational authority.

## Current decision

**BLOCKED FOR PRODUCTION / GOVERNANCE DECISION REQUIRED.** Certification remains fail-closed until independently observable evidence is available and all production blockers are resolved.

## Production blockers

- independently observable GitHub Actions step-level evidence;
- reviewed and committed `package-lock.json` for reproducible dependency installation;
- explicit governance approval to lift Migration Freeze;
- controlled PostgreSQL migration/schema verification;
- final actor-to-identity and scope RLS policy;
- real PostgreSQL isolation/concurrency evidence;
- persistent grant integration against deployed schema;
- persistent audit/outbox evidence;
- private storage/provider security;
- deployed HTTP authentication/RBAC enforcement;
- approved production DOCX templates/signature infrastructure;
- WhatsApp provider/webhook verification;
- scanner/device integration;
- monitoring, backup/restore and disaster-recovery evidence;
- provider retry/dead-letter/idempotency evidence;
- operational UI and authenticated API integration across the vertical slice.

## Safety rules

- no schema migration;
- no production database operation;
- no real detainee data;
- no production credentials or secrets;
- AI remains OFF;
- synthetic fixtures/test doubles only;
- certification remains fail-closed.

## Governance boundary

P10.41–P10.60 prepare the controlled path after an authorized governance decision. No code path may infer approval, lift the freeze, execute migrations, enable AI, or activate external providers automatically. Until an authorized decision and independently verifiable execution evidence exist, the database remains untouched and production activation remains blocked.
