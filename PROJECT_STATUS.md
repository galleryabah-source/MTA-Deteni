# MTA DETENI — Project Status

**Version:** Foundation v1.36
**Current Phase:** P12.1121–P12.1360 domain, reconciliation, reporting and controlled operator surface
**Implementation Track:** P12.1360
**Branch:** `phase-p12.961-13.200`

## Latest Progress

- P12.1121–P12.1160 domain aggregate composition;
- P12.1161–P12.1200 reconciliation evidence and promotion blocking;
- P12.1201–P12.1240 deterministic report artifact contract;
- P12.1241–P12.1280 controlled operator workflow;
- P12.1281–P12.1320 controlled release gate;
- P12.1321–P12.1360 controlled operator surface identity boundary.

## Integrated Application Model

RAP owns registration, administration and reporting; PERKES owns health records and health workflows; KAMTIB owns placement, movement, headcount, temporary exit, escort and operational QR; SUBBAG TU owns escort document administration; HEAD RUDENIM has oversight, read-only operational visibility and authority for petunjuk, arahan, rekomendasi and disposisi without direct operational editing.

## Operational Application Chain

`UI/API Command → Authorization Policy → Canonical Operational Envelope → Domain Aggregate → Transaction Context → Idempotency → Domain Workflow → Immutable Timeline/Audit → Operational Evidence → Reconciliation → Outbox → Projection Checkpoint → Read Model → QR/Movement/Temporary Exit → Reporting Snapshot → Report Artifact → Review → Approval → Generated Output`

Domain aggregate composition now rejects detainee, aggregate or correlation identity drift. Reconciliation mismatches block trusted downstream promotion. Report artifacts preserve snapshot provenance and a deterministic content hash. Operator report workflow is sequential and rejects undeclared transitions.

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

QR is an operational verification point, not a free-form data-entry path. Temporary-exit QR evidence requires explicit detainee/temporary-exit identity and validity-window checks.

Leadership remains oversight-read/directive only and is denied direct operational mutation.

Read models and report artifacts remain derived state. Committed operational evidence remains authoritative and rebuildable.

## Current Gate

**P12.1360 — DOMAIN/RECONCILIATION/REPORT/OPERATOR-SURFACE CONTRACT-READY / EXECUTION-CERTIFICATION PENDING**

Synthetic regression coverage was added for identity drift, reconciliation mismatch blocking, report provenance/hash and workflow transition control. Observable GitHub execution telemetry remains unavailable, so these controls are not certified as executed.

## Execution Certification Rule

CI or local execution may be certified only from observable command/job telemetry. `NOT_RUN`, missing evidence, non-zero exit codes, target mismatch, identity drift, or missing output identity remain blocked. No CI PASS, database PASS, production readiness, or operational authorisation is claimed.

## Next Gate

**P13.361–P13.600 — controlled application orchestration, operator dashboard/read-model composition, reporting preview contract and synthetic acceptance scenarios.**

No production or live-database step is implied by this next gate.
