# MTA DETENI — Project Status

**Foundation:** v1.134+
**Current Track:** P1 runtime integrity remediation / P9 kernel implementation / P13 closure evidence recovery
**Branch:** `main`
**Latest implementation checkpoint:** Controlled-nonprod Domain CI Run #1301 completed successfully on commit `d96429e13728a274943447d5770e3af434ca1ca8`; P1 executable certification remains pending dedicated certification evidence; P13 terminal closure is evidenced and CLOSED at P13.260881–274880

## P9 kernel implementation

- P9.0 repository audit and P9.1 runtime skeleton remain established by the project baseline.
- P9.2–P9.5 security-kernel contracts remain established for configuration, authentication, authorization and audit.
- P9.6 database-adapter contract is implemented with typed query/result and transaction boundaries, lifecycle state, configuration validation and explicit migration-role blocking.
- P9.7 transaction + idempotency boundary contract is implemented with deterministic EXECUTE / REPLAY / CONFLICT decisions and commit-after-success / rollback-on-failure semantics.
- P9.8 is implemented as the governed outbox contract; the runtime outbox contract is canonical and the older outbox contract remains compatibility-only.
- P9.9 private storage contract is implemented with PRIVATE/RESTRICTED classification, object identity, content fingerprint and replay/content-drift protection.
- P9.10 observability contract is implemented with structured event identity, correlation/request/transaction context and explicit outcome levels.
- P9.11 controlled execution harness contract is implemented with fail-closed evidence validation and PASS/exit-code consistency.
- P9.12 CI certification requires canonical harness evidence; certification cannot be established from summary booleans such as `artifactAvailable` alone.
- The CI evidence validator requires the exact five canonical harness controls: BUILD-5801, BUILD-5802, BUILD-5803, REG-5804 and REG-5805.
- P9.13 kernel certification requires the complete canonical P9.9–P9.12 control set, rejects duplicate control identities and remains non-authorizing: it cannot grant production access, execute migrations or enable AI.
- P9.6–P9.13 remain runtime-unbound. No live PostgreSQL connection, SQL execution, migration, production access or durable external publication is introduced by these contracts.

## P1 runtime integrity remediation

- Critical mutation orchestration binds its outbox boundary to the canonical runtime outbox contract rather than the legacy compatibility contract.
- The critical path remains: authorization → idempotency → transaction → domain mutation → audit → canonical outbox admission.
- Canonical outbox admission is asynchronous and fail-closed on event identity conflict or unexpected replay during a new mutation.
- The canonical execution-context contract defines request, correlation, transaction and idempotency identities as one immutable boundary.
- TransactionContext is now a direct alias of the canonical execution context, eliminating an independent transaction identity schema.
- Critical mutation normalizes and freezes one canonical execution context before idempotency and transaction execution.
- The dedicated critical-mutation context gate now covers transaction, audit and outbox downstream identities, with fail-closed continuity checks.
- Mutation audit records and runtime outbox events explicitly carry the canonical execution context rather than relying on synthetic side-channel evidence.
- Synthetic E2E regression verifies that transaction, audit and outbox adapters receive the same canonical context, while observability drift remains explicitly rejected.
- A dedicated P1 runtime certification contract now validates a fixed seven-control evidence set for context continuity, idempotency, transaction, audit, outbox, observability and failure-matrix behavior.
- P1 certification evidence is explicitly constrained to `controlled-nonprod`, a resolved commit and governance locks: production authorization false, migration executed false and AI enabled false.
- The P1 failure-matrix regression now exercises missing context, idempotency conflict, replay, domain failure, audit failure and outbox conflict/replay fail-closed behavior.
- The certification contract is evidence validation only; it cannot authorize production access, migrations, AI or external delivery.
- Optimistic concurrency execution contract provides deterministic ACCEPT/STALE_VERSION semantics.
- P1 remains pending an actual executable repository run with observable evidence; contract-level tests alone do not establish runtime certification.

## Latest CI observation boundary

- Commit `d96429e13728a274943447d5770e3af434ca1ca8` completed GitHub Actions Domain CI Run #1301 (`35562575271`) successfully.
- Static architecture gate, production typecheck, test typecheck, JavaScript regression, TypeScript domain tests, controlled execution evidence harness, evidence validation and artifact upload all completed successfully.
- Execution evidence status was `OBSERVED_PASS` with exactly five canonical controls: BUILD-5801, BUILD-5802, BUILD-5803, REG-5804 and REG-5805.
- Controlled execution artifact `10623155809` was successfully uploaded.
- P1 Runtime Observation Run #138 (`35562575299`) also completed successfully for the same commit; it remains observation-only and does not establish P1 certification.

## CI evidence recovery and hardening

- CI remains explicitly configured for `controlled-nonprod`, with deterministic typecheck/test stages and mandatory execution evidence validation plus artifact upload.
- Observable run #927 reached the runner successfully and exposed two static contract-gate defects: ARCH-5814 used a brittle artifact-name substring assertion, while STATE-5820 had a stale P13 range expectation.
- STATE-5820 is now aligned with the terminal governed range `P13.260881–274880`.
- ARCH-5814 is now semantic: it requires `actions/upload-artifact@v4`, the canonical controlled-evidence artifact name, the canonical `artifacts/mta-evidence/` path and an `always()` upload boundary.
- Run #927 independently confirmed that the actual artifact upload succeeded; the previous ARCH-5814 failure was therefore a false-negative static contract assertion rather than an upload failure.
- The corrected contract gate has been committed to `main`; the resulting CI run must still be observed end-to-end before certification advances.
- Evidence verification runs with `always()` so incomplete harness execution cannot silently skip validation; the evidence artifact remains uploaded with `always()`.
- The execution harness records a deterministic nonzero exit code when a child process terminates without a numeric exit status.
- P9.12 certification has regression coverage for complete observed evidence, incomplete evidence, wrong environment and forged summary-only input.

## P13 closure audit

- P13.260881–274880 remains the terminal governed checkpoint range.
- P13-EXIT-01, 02, 03, 04, 05 and 08 retain repository evidence.
- P13-EXIT-06 remains pending observable successful controlled-nonprod workflow execution and evidence artifact.
- P13-EXIT-07 is synchronized by the current status, changelog and exit-criteria document.
- No additional numbered checkpoints are manufactured solely to increase counts.

## Cloudflare deployment boundary

- The repository Cloudflare workflow is validation-only and does not perform a real deployment.
- Cloudflare API credentials are not required by this workflow.
- Any real Cloudflare deployment requires a separately approved controlled non-production target and explicit governance clearance.

## Governance locks

- Migration Freeze: **TRUE**
- AI: **OFF**
- Repository data: **SYNTHETIC ONLY**
- Production access: **NOT AUTHORIZED**
- Live PostgreSQL execution: **BLOCKED until explicit governance clearance and approved non-production target**
- Real detainee data, credentials, health records, WhatsApp exports and production PII: **PROHIBITED**
- No schema migration before approved data model, security controls, reconciliation and governance gate.

## Current certification state

**P9.9 Private Storage — CONTRACT IMPLEMENTED**
**P9.10 Observability — CONTRACT IMPLEMENTED / CONTEXT CONTINUITY HARDENED**
**P9.11 Test Harness — CONTRACT IMPLEMENTED**
**P9.12 CI Certification — HARDENED / OBSERVATION REQUIRED**
**P9.13 Kernel Certification — HARDENED CONTRACT / CI EVIDENCE REQUIRED**
**P13.260881–274880 — CLOSED / CONTROLLED-NONPROD EVIDENCE OBSERVED**
**P1 Runtime Integrity — EXECUTABLE CERTIFICATION CONTRACT + FAILURE MATRIX IMPLEMENTED / RUNTIME OBSERVATION PENDING**
**Cloudflare CI — CONFIGURATION VALIDATION ONLY / DEPLOYMENT BOUNDARY LOCKED**

## Closure rule

P13 is **CLOSED** because all eight P13 exit criteria have observable evidence, including successful controlled-nonprod workflow execution and evidence artifact for the closure candidate.

## Documentation integrity

`PROJECT_STATUS_NEXT.md` is retained as historical/stale planning context and must not override this current status.
