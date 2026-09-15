# MTA DETENI — Project Status

**Version:** P10.49 Controlled Temporary-Exit Vertical Slice  
**Branch:** `phase10.14-database-verification-package`  
**Certification:** NOT CERTIFIED  
**Migration Freeze:** TRUE  
**AI:** OFF  
**Data Boundary:** SYNTHETIC ONLY

## Completed checkpoints

P9 kernel foundations; P10.1–P10.13 operational/domain/database-contract foundations; P10.14–P10.17 controlled database verification packages; P10.18–P10.21 document-output operationalization and runtime integration contracts; P10.22–P10.24 CI evidence, release-readiness and safety consolidation; P10.25–P10.34 runtime, authorization, document API, audit, transaction and security certification-readiness contracts; P10.35 release-candidate hardening; P10.36 operational scenario and failure-injection matrix; P10.37 evidence decision record; P10.38 production-readiness traceability; P10.39 final pre-governance gate; P10.40 final pre-governance release manifest; P10.41 controlled governance decision packet; P10.42 controlled PostgreSQL/RLS execution runbook; P10.43 post-freeze verification evidence contract; P10.44 production cutover/rollback gate; P10.45 CI evidence and dependency transport hardening; P10.46 dependency reproducibility/lockfile gate; P10.47 CI transport diagnostic and evidence manifest; P10.48 reviewed-lockfile transport integrity; P10.49 controlled temporary-exit vertical slice contract.

## P10.48–P10.49 technical actions

P10.48 ensures CI distinguishes a reviewed repository lockfile from a runner-generated lockfile by using `git ls-files --error-unmatch package-lock.json`. The temporary dependency bootstrap uses `npm install --package-lock=false`; only a tracked lockfile permits `npm ci`. Certification remains blocked until the lockfile is reviewed and committed.

P10.49 adds a single controlled workflow contract for the core temporary-exit journey: REQUEST → VALIDATE → AUTHORIZE → GENERATE_EXIT_DOCUMENT → ASSIGN_ESCORT → APPROVE_DOCUMENT → ISSUE_DOCUMENT → GRANT_DOWNLOAD → DOWNLOAD → EXECUTE_EXIT → RETURN → CLOSE. The contract rejects skipped prerequisites and independently rejects provider activation before transaction commit. This is an orchestration boundary, not a claim that the complete deployed HTTP/UI/PostgreSQL workflow is implemented.

The deterministic regression contract is now 40 required test files. No real detainee data, schema migration, external provider activation, or AI execution was introduced.

## Integrated architecture

HTTP request → authentication → server-side authorization → scope/duty/classification/SoD → validation → domain command → critical transaction → audit/outbox → commit → post-commit provider. The P10.49 workflow contract now makes the intended end-to-end order explicit while keeping infrastructure adapters behind controlled boundaries. Document generation is deterministic and bound to immutable template/version/hash. Artifact download is protected by a persistent actor/scope/object/expiry-bound single-use grant. Administrative RBAC authority remains separate from operational authority. CI evidence is treated as a release-control input and cannot be promoted to certification without independently observable evidence.

## Current decision

**BLOCKED FOR PRODUCTION / GOVERNANCE DECISION REQUIRED.** The application foundation is stronger, but certification remains fail-closed until independently observable evidence is available and all production blockers are resolved.

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

P10.41–P10.49 prepare the controlled path after an authorized governance decision. No code path may infer approval, lift the freeze, execute migrations, enable AI, or activate external providers automatically. Until an authorized decision and independently verifiable execution evidence exist, the database remains untouched and production activation remains blocked.
