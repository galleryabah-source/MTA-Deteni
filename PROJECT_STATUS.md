# MTA DETENI — Project Status

**Version:** Foundation v1.37
**Current Phase:** P13.361–P13.600 controlled application surface
**Implementation Track:** P13.600
**Branch:** `phase-p12.961-13.200`

## Latest Progress

- P12.1121–P12.1160 domain aggregate composition;
- P12.1161–P12.1200 reconciliation evidence and promotion blocking;
- P12.1201–P12.1240 deterministic report artifact contract;
- P12.1241–P12.1280 controlled operator workflow;
- P12.1281–P12.1320 controlled release gate;
- P12.1321–P12.1360 controlled operator surface identity boundary;
- P13.361–P13.420 controlled application orchestration;
- P13.421–P13.480 operator dashboard/read-model composition;
- P13.481–P13.520 reporting preview contract;
- P13.521–P13.560 synthetic acceptance catalog;
- P13.561–P13.600 integrated surface governance and roadmap alignment.

## Integrated Application Model

RAP owns registration, administration and reporting; PERKES owns health records and health workflows; KAMTIB owns placement, movement, headcount, temporary exit, escort and operational QR; SUBBAG TU owns escort document administration; HEAD RUDENIM has oversight, read-only operational visibility and authority for petunjuk, arahan, rekomendasi and disposisi without direct operational editing.

## Operational Application Chain

`UI/API Command → Authorization Policy → Canonical Operational Envelope → Domain Aggregate → Transaction Context → Idempotency → Domain Workflow → Immutable Timeline/Audit → Operational Evidence → Reconciliation → Outbox → Projection Checkpoint → Read Model → Dashboard/QR/Movement/Temporary Exit → Reporting Snapshot → Report Preview → Report Artifact → Review → Approval → Generated Output`

P13 adds a controlled orchestration boundary that validates identity, authorization and idempotency before executing a domain handler inside the transaction abstraction. The dashboard is explicitly derived/read-only state. Report preview validates the existing Regu Jaga contract and preserves source snapshot identity. Ten synthetic acceptance scenarios now describe the principal governance paths.

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

Read models, dashboard views, report previews and report artifacts remain derived state. Committed operational evidence remains authoritative and rebuildable.

## Current Gate

**P13.600 — CONTROLLED APPLICATION SURFACE CONTRACT-READY / EXECUTION-CERTIFICATION PENDING**

Synthetic acceptance coverage has been added for orchestration, dashboard composition, report preview/provenance and the core governance boundaries. Observable GitHub execution telemetry is still not available in this work session, so these controls are not certified as executed.

## Execution Certification Rule

CI or local execution may be certified only from observable command/job telemetry. `NOT_RUN`, missing evidence, non-zero exit codes, target mismatch, identity drift, or missing output identity remain blocked. No CI PASS, database PASS, production readiness, or operational authorisation is claimed.

## Next Gate

**P13.601–P13.840 — controlled operator workbench, role-scoped navigation contract, QR verification surface contract, movement/headcount operational board and synthetic end-to-end acceptance composition.**

No production or live-database step is implied by this next gate.
