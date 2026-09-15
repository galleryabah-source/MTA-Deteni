# MTA DETENI — Project Status

**Version:** Foundation v1.38
**Current Phase:** P13.601–P13.840 controlled operator workbench and operational board
**Implementation Track:** P13.840
**Branch:** `phase-p12.961-13.200`

## Latest Progress

- P12.1121–P12.1360 domain, reconciliation, reporting and controlled operator surface;
- P13.361–P13.420 controlled application orchestration;
- P13.421–P13.480 operator dashboard/read-model composition;
- P13.481–P13.520 reporting preview contract;
- P13.521–P13.560 synthetic acceptance catalog;
- P13.561–P13.600 integrated surface governance and roadmap alignment;
- P13.601–P13.660 controlled operator workbench;
- P13.661–P13.720 role-scoped navigation contract;
- P13.721–P13.780 QR verification surface contract;
- P13.781–P13.820 movement/headcount operational board;
- P13.821–P13.840 synthetic end-to-end acceptance composition.

## Integrated Application Model

RAP owns registration, administration and reporting; PERKES owns health records and health workflows; KAMTIB owns placement, movement, headcount, temporary exit, escort and operational QR; SUBBAG TU owns escort document administration; HEAD RUDENIM has oversight, read-only operational visibility and authority for petunjuk, arahan, rekomendasi and disposisi without direct operational editing.

## Operational Application Chain

`UI/API Command → Authorization Policy → Canonical Operational Envelope → Domain Aggregate → Transaction Context → Idempotency → Domain Workflow → Immutable Timeline/Audit → Operational Evidence → Reconciliation → Outbox → Projection Checkpoint → Read Model → Dashboard/Workbench/Navigation → QR/Movement/Headcount/Temporary Exit → Reporting Snapshot → Report Preview → Report Artifact → Review → Approval → Generated Output`

P13.601–840 establishes a controlled operator workbench derived from the read model, role-scoped navigation, contextual QR verification, and a reconciliation-gated movement/headcount board. These remain application contracts and derived surfaces; command authorization and authoritative operational evidence remain upstream controls.

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

QR is an operational verification point, not a free-form data-entry path. P13 QR verification requires token, detainee identity, context and validity-window evaluation.

Leadership remains oversight-read/directive only and is denied direct operational mutation.

Read models, dashboard views, workbench navigation, operational boards, report previews and report artifacts remain derived state. Committed operational evidence remains authoritative and rebuildable.

## Current Gate

**P13.840 — CONTROLLED OPERATOR WORKBENCH / QR / OPERATIONAL BOARD CONTRACT-READY / EXECUTION-CERTIFICATION PENDING**

Synthetic acceptance coverage has been added for workbench composition, role-scoped navigation, QR identity/window validation, reconciliation-gated operational board and end-to-end composition. Observable GitHub execution telemetry is still not available in this work session, so these controls are not certified as executed.

## Execution Certification Rule

CI or local execution may be certified only from observable command/job telemetry. `NOT_RUN`, missing evidence, non-zero exit codes, target mismatch, identity drift, or missing output identity remain blocked. No CI PASS, database PASS, production readiness, or operational authorisation is claimed.

## Next Gate

**P13.841–P13.1040 — reporting workspace, immutable operator timeline composition, notification/recommendation boundaries, and stronger synthetic regression coverage.**

No production or live-database step is implied by this next gate.
