# MTA DETENI — Project Status

**Foundation:** v1.134+
**Current Track:** P1 runtime integrity remediation / P9 kernel implementation / P13 closure evidence recovery
**Branch:** `main`
**Latest implementation checkpoint:** Synthetic E2E execution-context harness added; P13 governed boundary remains P13.274880

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
- A dedicated critical-mutation context gate centralizes context establishment and fail-closed downstream continuity checks for transaction and observability identities.
- Synthetic regression coverage certifies normalization, immutability, transaction/observability continuity, incomplete-context rejection and downstream identity drift rejection.
- The critical mutation failure matrix covers replay, idempotency conflict, domain failure, audit failure and outbox conflict with rollback expectations.
- A synthetic E2E harness now observes the same canonical context across transaction, audit, outbox and observability, plus explicit observability-drift and failed-mutation evidence checks.
- Optimistic concurrency execution contract provides deterministic ACCEPT/STALE_VERSION semantics.
- Further executable end-to-end integration verification remains required before P1 can be certified complete.

## CI evidence recovery and hardening

- CI is explicitly configured for `controlled-nonprod`, with deterministic typecheck/test stages and mandatory execution evidence validation plus artifact upload.
- Evidence verification runs with `always()` so incomplete harness execution cannot silently skip validation; the evidence artifact remains uploaded with `always()`.
- The execution harness records a deterministic nonzero exit code when a child process terminates without a numeric exit status.
- P9.12 certification has regression coverage for complete observed evidence, incomplete evidence, wrong environment and forged summary-only input.
- Previous GitHub Actions failures exposed no usable steps/logs. Certification remains pending until a completed run exposes observable steps and a valid evidence artifact.

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
**P13.260881–274880 — IMPLEMENTED CONTRACTS / OBSERVATION PENDING**
**P1 Runtime Integrity — E2E SYNTHETIC HARNESS ADDED / CERTIFICATION PENDING EXECUTABLE REPOSITORY RUN**
**Cloudflare CI — CONFIGURATION VALIDATION ONLY / DEPLOYMENT BOUNDARY LOCKED**

## Closure rule

P13 is **NOT CLOSED** until all eight P13 exit criteria have observable evidence, including successful controlled-nonprod workflow execution and evidence artifacts for the closure candidate.

## Documentation integrity

`PROJECT_STATUS_NEXT.md` is retained as historical/stale planning context and must not override this current status.
