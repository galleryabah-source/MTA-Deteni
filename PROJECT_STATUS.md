# MTA DETENI — Project Status

**Version:** Foundation v1.33
**Current Phase:** P12.521–P12.680 persistence and projection integrity
**Implementation Track:** P12.680
**Branch:** `main`

## Latest Progress

- P12.521–P12.560 persistence repository boundary contract;
- P12.561–P12.600 idempotency observability contract;
- P12.601–P12.680 projection checkpoint, retry and rebuild integrity contract.

## Integrated Application Model

RAP owns registration, administration and reporting; PERKES owns health records and health workflows; KAMTIB owns placement, movement, headcount, temporary exit, escort and operational QR; SUBBAG TU owns escort document administration; HEAD RUDENIM has oversight, read-only operational visibility and authority for petunjuk, arahan, rekomendasi and disposisi without direct operational editing.

## Operational Application Chain

`UI/API Command → Authorization Policy → Transaction Context → Idempotency → Domain Workflow → Immutable Timeline/Audit → Outbox → Projection Checkpoint → Read Model → QR/Movement/Temporary Exit → Reporting`

Persistence operations now carry explicit transaction/actor/correlation identity. Idempotency outcomes have an observability contract. Projection progress is checkpointed only after successful processing and remains rebuildable from committed outbox evidence.

## Safety / Governance

- Migration Freeze: **TRUE**;
- AI: **OFF**;
- Repository data: **SYNTHETIC ONLY**;
- Production access: **NOT AUTHORIZED**;
- Live PostgreSQL execution: **BLOCKED until explicit governance clearance and an approved non-production target**;
- No real detainee data, credentials, health records, WhatsApp exports or production PII in GitHub;
- No autonomous AI decision-making;
- No direct WhatsApp/OCR/transcript → approved operational record;
- No schema migration before approved data model, security controls, reconciliation and governance gate.

## Design Integrity

Temporary-exit `COMPLETED` is not a deportation event. Deportation remains a separate operational workflow and QR context.

Leadership is explicitly limited to oversight-read and directive permissions and is denied direct operational mutation permissions.

Persistence and projection contracts are non-production boundaries. They do not authorize database connectivity, migrations, production execution, or operational use.

Projection checkpoints are derived progress markers; committed audit/outbox evidence remains authoritative and is the source for rebuild.

## Current Gate

**P12.680 — PERSISTENCE/PROJECTION CONTRACT-READY / EXECUTION-CERTIFICATION PENDING**

Regression coverage was added for persistence context validation, idempotency observation identity, and deterministic projection checkpoint generation. GitHub execution telemetry remains unavailable, so these controls are not certified as executed.

## Execution Certification Rule

CI or local execution may be certified only from observable command/job telemetry. `NOT_RUN`, missing evidence, non-zero exit codes, target mismatch, identity drift, or missing output identity remain blocked. No CI PASS, database PASS, production readiness, or operational authorisation is claimed.

## Next Gate

**P12.681–P12.760 — operational evidence ledger contract, projection failure/recovery matrix, API audit envelope, and cross-domain consistency gate.**

No production or live-database step is implied by this next gate.
