# MTA DETENI — Project Status

**Foundation:** v1.134+
**Current Track:** Integrated synthetic runtime acceptance / offline-LAN continuity / reporting-QR readiness / controlled daily-guard-report renderer + lifecycle workflow
**Branch:** `main`
**Latest implementation checkpoint:** Domain CI Run #1310 completed successfully on commit `e228c9fbaa2dfe8be572d99a79f76034b1d6625a`; audit remediation documentation is synchronized; P1 controlled-nonprod runtime evidence is OBSERVED_PASS; P13.260881–274880 is CLOSED; the active workstream is integrated synthetic runtime acceptance and resilience

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
- P1 controlled-nonprod executable evidence is now observed: Run #138 (`35562575299`) for commit `d96429e13728a274943447d5770e3af434ca1ca8` produced `OBSERVED_PASS` across all seven canonical controls. Artifact `10622772279` was uploaded successfully. This satisfies the runtime evidence boundary; it does not authorize production access, migrations, AI or external delivery.

## Latest CI observation boundary

- Commit `d96429e13728a274943447d5770e3af434ca1ca8` completed GitHub Actions Domain CI Run #1301 (`35562575271`) successfully.
- Subsequent documentation/remediation synchronization was validated by Domain CI Run #1310 on commit `e228c9fbaa2dfe8be572d99a79f76034b1d6625a`, which also completed successfully.
- Static architecture gate, production typecheck, test typecheck, JavaScript regression, TypeScript domain tests, controlled execution evidence harness, evidence validation and artifact upload all completed successfully.
- Execution evidence status was `OBSERVED_PASS` with exactly five canonical controls: BUILD-5801, BUILD-5802, BUILD-5803, REG-5804 and REG-5805.
- Controlled execution artifact `10623155809` was successfully uploaded.
- P1 Runtime Observation Run #138 (`35562575299`) completed successfully for commit `d96429e13728a274943447d5770e3af434ca1ca8`, producing OBSERVED_PASS evidence across all seven canonical controls. This is controlled-nonprod executable evidence and does not authorize production access, migration, AI activation or external delivery.

## CI evidence recovery and hardening

- CI remains explicitly configured for `controlled-nonprod`, with deterministic typecheck/test stages and mandatory execution evidence validation plus artifact upload.
- Observable run #927 reached the runner successfully and exposed two static contract-gate defects: ARCH-5814 used a brittle artifact-name substring assertion, while STATE-5820 had a stale P13 range expectation.
- STATE-5820 is now aligned with the terminal governed range `P13.260881–274880`.
- ARCH-5814 is now semantic: it requires `actions/upload-artifact@v4`, the canonical controlled-evidence artifact name, the canonical `artifacts/mta-evidence/` path and an `always()` upload boundary.
- Run #927 independently confirmed that the actual artifact upload succeeded; the previous ARCH-5814 failure was therefore a false-negative static contract assertion rather than an upload failure.
- The corrected contract gate is now aligned with the observed P13 closure state; Domain CI Run #1307 completed successfully after the gate remediation.
- Evidence verification runs with `always()` so incomplete harness execution cannot silently skip validation; the evidence artifact remains uploaded with `always()`.
- The execution harness records a deterministic nonzero exit code when a child process terminates without a numeric exit status.
- P9.12 certification has regression coverage for complete observed evidence, incomplete evidence, wrong environment and forged summary-only input.

## P13 closure audit

- P13.260881–274880 remains the terminal governed checkpoint range.
- P13-EXIT-01 through P13-EXIT-08 all have repository and/or controlled-nonprod observable evidence.
- P13-EXIT-06 is evidenced by successful controlled-nonprod Domain CI Run #1301 and artifact `10623155809`.
- P13-EXIT-07 is synchronized by the current status, changelog and exit-criteria document.
- No additional numbered checkpoints are manufactured solely to increase counts.

## Cloudflare deployment boundary

- The repository now performs a controlled deployment of the synthetic MTA DETENI web runtime to the configured Cloudflare Worker target `mta-deteni`.
- Deployment is restricted to the repository's synthetic web/runtime boundary; this does not authorize production database access, schema migration, real detainee data, AI activation or other production access.
- The deployment workflow independently verifies `https://mta-deteni.galleryabah.workers.dev/api/health` after upload, so a Wrangler postflight read error cannot be mistaken for a runtime deployment failure.
- Latest observed production-runtime deployment: GitHub Actions Run #66 (`35564857577`) on commit `0c21325003bc103ff7cace2e0ea32831c18be8c0`, with live health verification PASS.

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
**P9.12 CI Certification — HARDENED / OBSERVED PASS**
**P9.13 Kernel Certification — HARDENED CONTRACT / CONTROLLED EVIDENCE OBSERVED**
**P13.260881–274880 — CLOSED / CONTROLLED-NONPROD EVIDENCE OBSERVED**
**P1 Runtime Integrity — EXECUTABLE CERTIFICATION EVIDENCE OBSERVED_PASS / GOVERNANCE LOCKS INTACT**
**Cloudflare CI — CONTROLLED SYNTHETIC RUNTIME DEPLOYMENT / LIVE HEALTH VERIFIED**

## Closure rule

P13 is **CLOSED** because all eight P13 exit criteria have observable evidence, including successful controlled-nonprod workflow execution and evidence artifact for the closure candidate.

## Documentation integrity

`PROJECT_STATUS_NEXT.md` is retained as historical/stale planning context and must not override this current status.


### D5 Workflow Checkpoint v1.2

The synthetic Daily Guard Report now has a deny-by-default lifecycle: `DRAFT → VALIDATED → GENERATED → IN_REVIEW → APPROVED → FINAL`, with `CHANGES_REQUESTED → DRAFT` revision recovery and FINAL-only download. Migration freeze remains active and no real detainee data is introduced.


### D5.7 Retrieval & Revision History

The Daily Guard Report synthetic runtime now provides date/regu/shift filtering, revision-history inspection, FINAL-only bulk selection, and a deterministic bulk-download manifest foundation. Single-report FINAL download remains browser Print/Save-as-PDF with DOCUMENT_DOWNLOAD audit evidence. Actual ZIP aggregation and production storage remain gated; migration freeze and synthetic-only boundaries are intact.
