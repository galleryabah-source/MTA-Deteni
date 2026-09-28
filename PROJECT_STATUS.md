# MTA DETENI — P2 Canonical Persistence Hardening Addendum (2026-09-28)

## Data Deteni persistence seam

Implementation has been added for the canonical production persistence path:

`Data Deteni Command → Production API → Supabase `mta_detainees` → database audit trigger → hydrate`

Implemented:
- `web/mta-production-state-adapter-v1.js`: production detainee create/update/archive mutation adapter and DB-to-runtime hydration.
- `web/mta-domain-commands-v2.js`: canonical production-aware detainee command boundary.
- `web/mta-app-runtime-full.js`: Data Deteni form now awaits canonical command results and hydrates the refreshed production state instead of writing browser storage in production mode.
- Optional detainee fields are persisted in the existing `mta_detainees.metadata` JSONB field; no schema migration was introduced.
- `test/detainee-canonical-persistence-regression.test.mjs`: static persistence seam regression contract.
- Production DB audit remains database-trigger based through the existing `mta_audit_row_change` trigger.

Verification boundary:
- Repository implementation: **STAGED**
- Live production DB mutation: **NOT EXECUTED**
- Two-computer/two-user browser verification: **PENDING AUTHORIZED DEPLOYMENT/TEST STATION**
- Migration Freeze remains **TRUE**.
- AI remains **OFF**.
- Repository data remains **SYNTHETIC ONLY**.

The implementation is deliberately not certified as live multi-client persistence until the deployed runtime is exercised with two authenticated users against the same database.

---

# MTA DETENI — Global Canonical Pipeline Certification Closure (2026-09-27)

## Certification result — GREEN

Canonical hardening and CI Process 01 remediation are green on commit `c29b534cee8aa169b29a29848dc38e4d0e3fa489`.

Evidence:
- Domain CI Run #2563 — **PASS**
- Static Integration Gate Run #774 — **PASS**
- Feature Verification Run #118 — **PASS**
- Device Regression Run #620 — **PASS** (phone, tablet, desktop, desktop-HD)
- P1 Runtime Observation Run #664 — **PASS**
- P9.13 Kernel Certification — **PASS**
- Integrated Acceptance Runtime Evidence — **PASS**
- Local Runtime Adapter / Recovery Evidence — **PASS**
- Backup / Restore / Disaster Recovery Certification — **PASS**
- Controlled Execution Evidence — **PASS**
- F5.4 Direct Final Integrity Certification — **PASS**, including evidence verification/upload.

### Global hardening gates

- **Global Mutation Surface Certification — PASS**
- **State / Evidence Chain Verification — PASS**
- **F5.4 Direct Final Integrity Certification — PASS**

The certified chain is:
`Scan → Resolve → Data → Action → Mutation → Audit → Monitor → Report → Evidence`

Governance locks remain unchanged:
- Migration Freeze: **TRUE**
- AI: **OFF**
- Repository data: **SYNTHETIC ONLY**
- Production access: **NOT AUTHORIZED**

No database schema migration, production DB execution, AI activation, real detainee data, or production deployment was introduced.

Feature Registry statuses remain conservative: synthetic/non-production CI evidence does not automatically promote user-facing features from IMPLEMENTED to VERIFIED.

---

# MTA DETENI — Canonical Pipeline Hardening Addendum (2026-09-27)

## H1–H8 Mutation Ownership Hardening — CLOSED GREEN

The canonical mutation hardening track was executed without adding a user-facing feature or changing the database schema.

### H1 — Placement single-owner
- Placement UI now delegates mutation to the existing canonical `window.mtaUnifiedAssignPlacement` command.
- Legacy placement UI no longer performs direct `placements.unshift` mutation.
- Master Room remains the governing source for target-room selection.

### H2 — Detainee mutation single-owner
- Added `web/mta-domain-commands-v1.js` as the canonical detainee domain-command boundary.
- Create/update operations delegate to `MTADeteniDomainCommands.createDetainee/updateDetainee`.
- Initial placement continues through the canonical placement command rather than a second placement writer.

### H3 — Archive/status single-owner
- Detainee archive/status mutation delegates to `MTADeteniDomainCommands.archiveDetainee`.
- QR suspension and audit evidence are produced within that canonical command.

### H4 — Legacy mutation entrypoints neutralized
- Legacy core movement entrypoint no longer mutates `db.movements`; it redirects to canonical Movement UI.
- Legacy placement/detainee/archive entrypoints no longer own domain mutation.

### H5 — Canonical ownership regression
- Added `test/canonical-mutation-ownership.test.mjs`.
- Added it to the consolidated feature verification contract.
- Static tests explicitly reject direct mutation in the hardened UI entrypoints.

### H6 — Full CI re-run
Latest canonical commit: `6c091ec41baaa62231f437a0f36dd614e7d349ed`.

Latest evidence:
- Domain CI Run #2470 — **PASS**
- Static Integration Gate Run #681 — **PASS**
- Feature Verification Run #31 — **PASS**
- Device Regression Run #527 — **PASS**
- UI Responsive / Offline Smoke Run #347 — **PASS**
- Cloudflare Non-Production Preflight Run #386 — **PASS**
- P1 Runtime Observation Run #645 — **PASS**

### H7 — F5.4 re-certification
Domain CI Run #2470 completed the full certification chain, including:
- P9.13 Kernel Certification;
- Integrated Acceptance Runtime Evidence;
- **F5.4 Direct Final Integrity Certification — PASS**;
- local runtime adapter/recovery evidence;
- backup/restore disaster recovery certification;
- controlled execution evidence;
- final F5.4 evidence verification and upload.

### H8 — Feature Registry reconciliation
No feature was promoted to VERIFIED solely from synthetic CI. Existing feature statuses remain governed by their evidence contract. The hardening work is recorded as platform/governance work rather than a new user-facing feature.

**Important boundary:** Unified Data Flow Audit remains not certified globally because other legacy mutation surfaces outside H1–H4 still require audit. Production deployment, production DB execution, migration, AI activation, real detainee data and durable external publication remain locked.

## Next hardening target

Continue the same canonical-ownership audit on the remaining mutation surfaces (notably leave creation/status, room QR state, backup/restore and other legacy writers), then re-run the full certification chain. Do not add unrelated features or deploy production before the global mutation-surface audit is clean.

# MTA DETENI — Current Audit Addendum (2026-09-27)

## CI Process 01 Closure / Canonical Pipeline Hardening

The CI Process 01 remediation series is now **GREEN** on commit `b486d003ba697ce6dc1ae1b49cadeace4b782d84`.

Latest controlled-nonprod evidence:
- Domain CI Run #2460 — **PASS**
- Static Integration Gate Run #671 — **PASS**
- Feature Verification Run #23 — **PASS**
- Device Regression Run #517 — **PASS**
- UI Responsive / Offline Smoke Run #341 — **PASS**
- Cloudflare Non-Production Preflight Run #380 — **PASS**

The remediation resolved four concrete integration defects without changing the governed runtime architecture:
1. removed lockfile-dependent npm cache configuration from Feature Verification;
2. restored the malformed detainee-detail navigation test source;
3. aligned the unified runtime contract from stale v20 to canonical runtime v22;
4. promoted User Management to a canonical unified navigation surface so authenticated browser acceptance is deterministic across device profiles.

Domain CI Run #2460 reached and passed the complete certification/evidence chain, including P9.13 Kernel Certification, Integrated Acceptance Runtime Evidence, F5.4 Direct Final Integrity Certification, Local Runtime Adapter/Recovery Evidence, Backup/Restore/DR Certification, Controlled Execution Evidence and final evidence validation/upload.

**This closes the current CI Process 01 blocker. It does not authorize production access, database execution, schema migration, AI activation, real detainee data or durable external publication.**

## Next Workstream — Canonical Pipeline Hardening

With Process 01 green, the active workstream is no longer CI repair. The next work is **canonical pipeline hardening and runtime-boundary verification**, in this order:

1. reconcile project/feature evidence against the latest green CI;
2. audit canonical Scan → Resolve → Data → Action → Mutation → Audit → Monitor → Report → Evidence chain for stale/duplicate ownership;
3. verify feature-specific runtime evidence without weakening governance locks;
4. verify deployment boundary and Cloudflare health contract on the current canonical commit when an authorized deployment station is available;
5. only then advance feature statuses from IMPLEMENTED to VERIFIED where the registry evidence contract is fully satisfied.

No schema migration is introduced by this workstream.

---

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
