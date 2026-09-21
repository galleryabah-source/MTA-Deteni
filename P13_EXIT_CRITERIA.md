# MTA DETENI — P13 Exit Criteria

**Purpose:** define the evidence gate for declaring P13 CLOSED. This document does not itself grant authorization, production access, database execution, AI activation, external transport, or durable publication.

## Exit criteria

| ID | Criterion | Required evidence |
|---|---|---|
| P13-EXIT-01 | Scope and terminal boundary are explicit | Current project status identifies the governed P13 track and this exit-criteria contract is versioned in-repo. |
| P13-EXIT-02 | Integrity identity continuity is fail-closed | P13 contract tests cover artifact/parent, decision-fingerprint and downstream identity alias rejection across the implemented chain. |
| P13-EXIT-03 | Replay semantics are deterministic | Regression tests demonstrate ADMIT/REPLAY/CONFLICT behavior and fingerprint drift conflict. |
| P13-EXIT-04 | Review-only and non-executable boundary is preserved | Contracts enforce syntheticOnly=true and all authorization, dispatch, transport, execution and durable-publication flags remain false. |
| P13-EXIT-05 | Regression coverage is present and runnable | Repository contains P13 regression tests plus deterministic package scripts and CI workflow steps for typecheck and tests. |
| P13-EXIT-06 | Controlled execution is observable | A GitHub Actions run for the relevant commit has observable successful workflow steps and execution evidence artifacts. |
| P13-EXIT-07 | Documentation is synchronized | PROJECT_STATUS.md and CHANGELOG.md describe the same current P13 boundary; stale planning documents are explicitly marked historical/stale. |
| P13-EXIT-08 | Governance locks remain intact | Migration Freeze TRUE, AI OFF, synthetic-only repository, production access unauthorized, live PostgreSQL blocked, and prohibited real/production data remain enforced. |

## Closure rule

P13 may be marked **CLOSED** only when P13-EXIT-01 through P13-EXIT-08 are all evidenced. Missing CI observation evidence keeps P13 in **IMPLEMENTED CONTRACTS / OBSERVATION PENDING**; this condition no longer applies to the current closure candidate because controlled-nonprod evidence is present.

## Current assessment

As of commit `d67cc9496cba8bdbea653e609e461c84c49c1de4`, all eight exit criteria are evidenced. P13-EXIT-06 is evidenced by Domain CI Run #1301 (`35562575271`) with successful static gate, production typecheck, test typecheck, JavaScript regression, TypeScript domain tests, controlled execution evidence harness, evidence validation and artifact upload; artifact `10623155809` was uploaded successfully. Domain CI Run #1304 (`35562708882`) subsequently confirmed the synchronized closure documentation also passes the complete CI pipeline. The Cloudflare workflow remains validation-only and is not required to satisfy P13-EXIT-06.

## Non-goals

- No checkpoint inflation: additional numbered ranges are not created solely to increase checkpoint counts.
- No schema migration.
- No live PostgreSQL execution.
- No production access.
- No real detainee data or production PII.
- No AI activation.
- No external transport or durable publication.
