# MTA DETENI — Project Status

**Version:** Foundation v1.32
**Current Phase:** P12.361–P12.520 persistence boundary and rebuildable read-model integrity
**Implementation Track:** P12.520
**Branch:** `main`

## Latest Progress

- P12.361–P12.420 PostgreSQL transaction boundary contract;
- P12.421–P12.480 durable outbox consumer contract;
- P12.481–P12.520 rebuildable read-model replay contract and regression coverage.

## Integrated Application Model

RAP owns registration, administration and reporting; PERKES owns health records and health workflows; KAMTIB owns placement, movement, headcount, temporary exit, escort and operational QR; SUBBAG TU owns escort document administration; HEAD RUDENIM has oversight, read-only operational visibility and authority for petunjuk, arahan, rekomendasi and disposisi without direct operational editing.

## Operational Application Chain

`UI/API Command → Authorization Policy → Transaction Context → Idempotency → Domain Workflow → Immutable Timeline/Audit → Outbox → Read Model → QR/Movement/Temporary Exit → Reporting`

Persistence is explicitly separated into a future PostgreSQL transaction contract, controlled durable-outbox consumption semantics, and a rebuildable read-model projection path. Read models remain derived state; committed operational evidence remains authoritative.

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

The PostgreSQL transaction boundary is a contract only; it does not authorize database connectivity, migrations, or production execution. Durable outbox and projection replay contracts are also non-production boundaries until execution is explicitly cleared and evidenced.

## Current Gate

**P12.520 — PERSISTENCE/REPLAY CONTRACT-READY / EXECUTION-CERTIFICATION PENDING**

Regression coverage includes rollback behavior, outbox consumer-context validation, and deterministic replay from committed outbox evidence. GitHub execution telemetry remains unavailable, so these controls are not certified as executed.

## Execution Certification Rule

CI or local execution may be certified only from observable command/job telemetry. `NOT_RUN`, missing evidence, non-zero exit codes, target mismatch, identity drift, or missing output identity remain blocked. No CI PASS, database PASS, production readiness, or operational authorisation is claimed.

## Next Gate

**P12.521–P12.600 — persistence repository adapters, durable idempotency storage semantics, projection checkpoint/retry policy, and controlled API observability contracts.**

No production or live-database step is implied by this next gate.
