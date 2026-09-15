# MTA DETENI — Project Status

**Version:** Foundation v1.35
**Current Phase:** P12.841–P12.960 canonical operational, QR and reporting integrity
**Implementation Track:** P12.960
**Branch:** `main`

## Latest Progress

- P12.841–P12.880 canonical operational aggregate envelope;
- P12.881–P12.920 QR / temporary-exit evidence binding;
- P12.921–P12.960 reporting snapshot integrity and synthetic E2E governance coverage.

## Integrated Application Model

RAP owns registration, administration and reporting; PERKES owns health records and health workflows; KAMTIB owns placement, movement, headcount, temporary exit, escort and operational QR; SUBBAG TU owns escort document administration; HEAD RUDENIM has oversight, read-only operational visibility and authority for petunjuk, arahan, rekomendasi and disposisi without direct operational editing.

## Operational Application Chain

`UI/API Command → Authorization Policy → Canonical Operational Envelope → Transaction Context → Idempotency → Domain Workflow → Immutable Timeline/Audit → Operational Evidence → Outbox → Projection Checkpoint → Read Model → QR/Movement/Temporary Exit → Reporting`

One operational action now has a canonical identity chain. QR verification is explicitly contextualized, temporary-exit scans are bound to their operational record, and deportation remains a separate QR context. Reporting snapshots retain deterministic source provenance.

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

QR is an operational verification point, not a free-form data-entry path. A temporary-exit QR binding requires the detainee and temporary-exit identity and evaluates the scan against the explicit validity window.

Leadership is explicitly limited to oversight-read and directive permissions and is denied direct operational mutation permissions.

Read models and reporting snapshots remain derived state. Committed operational evidence remains authoritative and is the basis for rebuilding downstream projections.

## Current Gate

**P12.960 — CANONICAL/QR/REPORTING CONTRACT-READY / EXECUTION-CERTIFICATION PENDING**

Regression coverage was added for canonical identity, QR validity/context separation and deterministic reporting provenance. GitHub execution telemetry remains unavailable, so these controls are not certified as executed.

## Execution Certification Rule

CI or local execution may be certified only from observable command/job telemetry. `NOT_RUN`, missing evidence, non-zero exit codes, target mismatch, identity drift, or missing output identity remain blocked. No CI PASS, database PASS, production readiness, or operational authorisation is claimed.

## Next Gate

**P12.961–P13.080 — end-to-end domain aggregate composition, reconciliation evidence, reporting generation contract and controlled operator workflow surface.**

No production or live-database step is implied by this next gate.
