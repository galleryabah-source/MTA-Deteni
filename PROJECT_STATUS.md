# MTA DETENI — Project Status

**Foundation:** v1.60+
**Current Track:** P13.5823–5880 controlled synthetic domain journey
**Branch:** `main`
**Latest implementation commit:** `0125ee734880f5b2f17d5124ccf81ffce71147ca`

## Latest progress

- P13.5823 — canonical `HEAD_RUDENIM` enforced in the shared domain type; historical `LEADERSHIP` is retained only as an explicit compatibility type;
- P13.5824–5826 — deterministic temporary-exit synthetic journey tests: complete happy path, invalid skip/reversal rejection and terminal-state protection;
- P13.5809–5822 — deterministic architecture/governance contract gate and observable execution/evidence acceptance contract;
- P13.5801–5808 — deterministic non-production execution harness, test compilation boundary and controlled evidence upload;
- P13.5681–5720 — canonical governance vocabulary;
- P13.5721–5760 — DR evidence binding;
- P13.5761–5800 — report rendering evidence gate.

## Integrated application model

RAP owns registration, administration and reporting; PERKES owns health records and health workflows; KAMTIB owns placement, movement, headcount, temporary exit, escort and operational QR; SUBBAG TU owns escort-document administration; HEAD RUDENIM has oversight, read-only operational visibility and authority for petunjuk, arahan, rekomendasi and disposisi without direct operational editing.

The application chain remains:

`UI/API Command → Authorization Policy → Canonical Operational Envelope → Domain Aggregate → Transaction Context → Idempotency → Domain Workflow → Immutable Timeline/Audit → Operational Evidence → Reconciliation → Outbox → Projection Checkpoint → Read Model → QR/Movement/Temporary Exit → Reporting Snapshot → Review/Approval → Generated Artifact`

## Governance locks

- Migration Freeze: **TRUE**;
- AI: **OFF**;
- Repository data: **SYNTHETIC ONLY**;
- Production access: **NOT AUTHORIZED**;
- Live PostgreSQL execution: **BLOCKED until explicit governance clearance and an approved non-production target**;
- Real detainee data, credentials, health records, WhatsApp exports and production PII: **PROHIBITED**;
- No schema migration before approved data model, security controls, reconciliation and governance gate.

## Current certification state

**P13.5826 — CONTROLLED SYNTHETIC DOMAIN JOURNEY IMPLEMENTED / OBSERVATION PENDING**

The repository now has executable, dependency-light synthetic tests for the temporary-exit state machine. These tests prove the intended ordered lifecycle and reject skipped/reversed transitions, but they are not yet certified by CI because GitHub Actions continues to terminate with no usable step telemetry.

Latest observed CI behavior remains an infrastructure/runner observation blocker: completed failure with zero reported steps. A targeted rerun was accepted by GitHub, but execution telemetry must still be observed before claiming PASS.

## Next gate

**P13.5827–5880 — observable CI/evidence identity validation and expansion of synthetic domain-surface checks for movement, placement, authorization and reporting boundaries.**

**Following:** P13.5881–5960 — runtime/browser/RBAC synthetic journey and LAN/offline continuity harness design.

No production deployment, live operational integration, AI activation, or schema migration is implied.
