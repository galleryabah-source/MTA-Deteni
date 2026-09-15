# MTA DETENI — Project Status

**Version:** Foundation v1.43
**Current Phase:** P13.1601–P13.1840 application shell, navigation, report preview/download and synthetic operator journey
**Implementation Track:** P13.1840
**Branch:** `phase-p12.961-13.200`

## Latest Progress

- P13.1601–P13.1640 — governed application shell contract;
- P13.1641–P13.1680 — navigation state contract;
- P13.1681–P13.1720 — report preview/download boundary;
- P13.1721–P13.1760 — synthetic end-to-end operator journey;
- P13.1761–P13.1800 — cross-module synthetic journey acceptance;
- P13.1801–P13.1840 — UI-to-release evidence binding.

## Integrated Application Model

RAP owns registration, administration and reporting; PERKES owns health records and health workflows; KAMTIB owns placement, movement, headcount, temporary exit, escort and operational QR; SUBBAG TU owns escort document administration; HEAD RUDENIM has oversight, read-only operational visibility and authority for petunjuk, arahan, rekomendasi and disposisi without direct operational editing.

## Operational Application Chain

`UI/API Command → Authorization Policy → Canonical Operational Envelope → Domain Aggregate → Transaction Context → Idempotency → Domain Workflow → Immutable Timeline/Audit → Operational Evidence → Reconciliation → Outbox → Projection Checkpoint → Read Model → Dashboard/Workbench/Navigation → QR/Movement/Headcount/Temporary Exit → Reporting Workspace/Timeline → Reporting Snapshot → Report Preview → Report Artifact → Document Output → Template → Notification/Recommendation → Review → Human Approval Binding → Generated Output → Read-only Audit → Synthetic Release Evidence → Operator UI Contract → Responsive Layout → Report Rendering Adapter → Synthetic Release Manifest → Application Shell → Navigation State → Preview/Download → Synthetic Operator Journey → Cross-Module Acceptance → UI Release Evidence`

P13.1601–1840 establishes the governed handoff from application-core contracts to an eventual operator-facing application. Preview is non-mutating; download requires approval binding; the synthetic journey remains explicitly non-production.

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

QR is an operational verification point, not a free-form data-entry path. Verification remains contextual and validity-window constrained.

Leadership remains oversight-read/directive only and is denied direct operational mutation.

Read models, dashboard views, workbench navigation, operational boards, reporting workspace, timelines, notifications, report previews, report artifacts, document outputs, templates, dashboard state, UI contracts, rendering adapters, application shell and navigation state remain derived/control state. Committed operational evidence remains authoritative and rebuildable.

Report download is not an authorization bypass: approval binding remains authoritative. Synthetic operator journeys and UI release evidence cannot authorize production execution or enable AI.

## Current Gate

**P13.1840 — APPLICATION SHELL / NAVIGATION / PREVIEW-DOWNLOAD / SYNTHETIC OPERATOR JOURNEY CONTRACT-READY / EXECUTION-CERTIFICATION PENDING**

Regression coverage has been added for shell safety, navigation integrity, synthetic journey sequence and UI release evidence. Observable GitHub execution telemetry remains unavailable in this work session, so these controls are not certified as executed.

## Execution Certification Rule

CI or local execution may be certified only from observable command/job telemetry. `NOT_RUN`, missing evidence, non-zero exit codes, target mismatch, identity drift, or missing output identity remain blocked. No CI PASS, database PASS, production readiness, or operational authorisation is claimed.

## Next Gate

**P13.1841–P13.2080 — operator command UX contracts, offline/degraded-state safety, audit-aware notification center, and stronger synthetic release trace.**

No production or live-database step is implied by this next gate.
