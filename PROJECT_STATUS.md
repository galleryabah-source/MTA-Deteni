# MTA DETENI — Project Status

**Version:** Foundation v1.42
**Current Phase:** P13.1401–P13.1600 operator UI, responsive layout, report rendering and synthetic release manifest
**Implementation Track:** P13.1600
**Branch:** `phase-p12.961-13.200`

## Latest Progress

- P13.1401–P13.1460 operator-facing UI contract;
- P13.1461–P13.1510 responsive layout model;
- P13.1511–P13.1550 report rendering adapter boundary;
- P13.1551–P13.1600 synthetic release manifest.

## Integrated Application Model

RAP owns registration, administration and reporting; PERKES owns health records and health workflows; KAMTIB owns placement, movement, headcount, temporary exit, escort and operational QR; SUBBAG TU owns escort document administration; HEAD RUDENIM has oversight, read-only operational visibility and authority for petunjuk, arahan, rekomendasi and disposisi without direct operational editing.

## Operational Application Chain

`UI/API Command → Authorization Policy → Canonical Operational Envelope → Domain Aggregate → Transaction Context → Idempotency → Domain Workflow → Immutable Timeline/Audit → Operational Evidence → Reconciliation → Outbox → Projection Checkpoint → Read Model → Dashboard/Workbench/Navigation → QR/Movement/Headcount/Temporary Exit → Reporting Workspace/Timeline → Reporting Snapshot → Report Preview → Report Artifact → Document Output → Template → Notification/Recommendation → Review → Human Approval Binding → Generated Output → Read-only Audit → Synthetic Release Evidence → Operator UI Contract → Responsive Layout → Report Rendering Adapter → Synthetic Release Manifest`

P13.1401–1600 establishes the contract boundary between the governed application core and the eventual operator-facing UI. Phone/tablet/desktop behavior is explicit, report rendering remains adapter-based, and the release manifest cannot authorize production or enable AI.

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

Read models, dashboard views, workbench navigation, operational boards, reporting workspace, timelines, notifications, report previews, report artifacts, document outputs, templates, dashboard state, UI contracts and rendering adapters remain derived/control state. Committed operational evidence remains authoritative and rebuildable.

Approval is human-bound to the exact artifact/report/evidence fingerprint. Cross-domain acceptance and release evidence are synthetic and governance-gated; neither authorizes production execution.

## Current Gate

**P13.1600 — OPERATOR UI / RESPONSIVE LAYOUT / REPORT RENDERING / SYNTHETIC RELEASE MANIFEST CONTRACT-READY / EXECUTION-CERTIFICATION PENDING**

Regression coverage has been added for responsive layout behavior, report rendering identity/template preservation and synthetic release manifest safety. Observable GitHub execution telemetry remains unavailable in this work session, so these controls are not certified as executed.

## Execution Certification Rule

CI or local execution may be certified only from observable command/job telemetry. `NOT_RUN`, missing evidence, non-zero exit codes, target mismatch, identity drift, or missing output identity remain blocked. No CI PASS, database PASS, production readiness, or operational authorisation is claimed.

## Next Gate

**P13.1601–P13.1840 — application shell contract, navigation state, report preview/download boundary, and synthetic operator journey acceptance.**

No production or live-database step is implied by this next gate.
