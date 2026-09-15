# MTA DETENI — Project Status

**Version:** P10.54 Operational Temporary-Exit Execution Boundary  
**Branch:** `phase10.14-database-verification-package`  
**Certification:** NOT CERTIFIED  
**Migration Freeze:** TRUE  
**AI:** OFF  
**Data Boundary:** SYNTHETIC ONLY

## Completed checkpoints

P9 kernel foundations; P10.1–P10.13 operational/domain/database-contract foundations; P10.14–P10.17 controlled database verification packages; P10.18–P10.21 document-output operationalization and runtime integration contracts; P10.22–P10.24 CI evidence, release-readiness and safety consolidation; P10.25–P10.34 runtime, authorization, document API, audit, transaction and security certification-readiness contracts; P10.35 release-candidate hardening; P10.36 operational scenario and failure-injection matrix; P10.37 evidence decision record; P10.38 production-readiness traceability; P10.39 final pre-governance gate; P10.40 final pre-governance release manifest; P10.41 controlled governance decision packet; P10.42 controlled PostgreSQL/RLS execution runbook; P10.43 post-freeze verification evidence contract; P10.44 production cutover/rollback gate; P10.45 CI evidence and dependency transport hardening; P10.46 dependency reproducibility/lockfile gate; P10.47 CI transport diagnostic and evidence manifest; P10.48 reviewed-lockfile transport integrity; P10.49 controlled temporary-exit vertical slice contract; P10.50 fail-closed HTTP command gateway boundary; P10.51 document issuance SoD orchestration; P10.52 temporary-exit timeline read model; P10.53 integrated temporary-exit workflow; P10.54 operational temporary-exit execution/return boundary.

## P10.52–P10.54 technical actions

P10.52 adds an append-only synthetic timeline read model with sequence ordering, actor identity, result, timestamp and metadata; CLOSED timelines reject later mutation.

P10.53 composes the temporary-exit sequence with document preparation/approval/issuance SoD, verified artifact binding and actor/scope/object-bound single-use download handoff. Provider activation remains behind an explicit post-commit boundary.

P10.54 adds the operational state boundary for EXECUTE_EXIT → HANDOVER_RECORDED → RETURN → DUTY_COMPLETED → CLOSE. Invalid state skips are rejected before mutation. This keeps the application workflow aligned with the existing detainee lifecycle rather than treating document download as the end of the business process.

The deterministic regression contract is now 45 required test files. No real detainee data, schema migration, external provider activation, or AI execution was introduced.

## Integrated architecture

HTTP request → authenticated server session → CSRF protection for mutation → server-side authorization → scope/duty/classification/SoD → validation → temporary-exit command → document preparation → approval → issuance → artifact handoff → download → operational exit → return → close → critical transaction/audit/outbox → commit → post-commit provider.

The canonical temporary-exit workflow is REQUEST → VALIDATE → AUTHORIZE → GENERATE_EXIT_DOCUMENT → ASSIGN_ESCORT → APPROVE_DOCUMENT → ISSUE_DOCUMENT → GRANT_DOWNLOAD → DOWNLOAD → EXECUTE_EXIT → RETURN → CLOSE.

The current composition is a synthetic application-layer vertical slice. It does not claim persistent PostgreSQL execution, production HTTP deployment, approved production DOCX templates, or external provider activation. Document generation remains deterministic and bound to immutable template/version/hash. Artifact handoff remains actor/scope/object/expiry-bound and single-use. Administrative RBAC authority remains separate from operational authority.

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

P10.41–P10.54 prepare the controlled path after an authorized governance decision. No code path may infer approval, lift the freeze, execute migrations, enable AI, or activate external providers automatically. Until an authorized decision and independently verifiable execution evidence exist, the database remains untouched and production activation remains blocked.
