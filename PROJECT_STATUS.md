# MTA DETENI — Project Status

**Version:** Foundation v1.44
**Current Phase:** P13.1841–P13.2040 command UX, offline/degraded safety, notification center and synthetic release trace
**Implementation Track:** P13.2040
**Branch:** `phase-p12.961-13.200`

## Latest Progress

- P13.1841–P13.1880 — governed operator command UX contract;
- P13.1881–P13.1920 — offline/degraded-state safety boundary;
- P13.1921–P13.1960 — evidence-aware notification center;
- P13.1961–P13.2000 — operational alert acknowledgement bound to evidence;
- P13.2001–P13.2040 — synthetic end-to-end release trace.

## Integrated Application Model

RAP owns registration, administration and reporting; PERKES owns health records and health workflows; KAMTIB owns placement, movement, headcount, temporary exit, escort and operational QR; SUBBAG TU owns escort document administration; HEAD RUDENIM has oversight, read-only operational visibility and authority for petunjuk, arahan, rekomendasi and disposisi without direct operational editing.

## Operational Application Chain

`UI/API Command → Authorization Policy → Canonical Operational Envelope → Domain Aggregate → Transaction Context → Idempotency → Domain Workflow → Immutable Timeline/Audit → Operational Evidence → Reconciliation → Outbox → Projection Checkpoint → Read Model → Dashboard/Workbench/Navigation → QR/Movement/Headcount/Temporary Exit → Reporting Workspace/Timeline → Reporting Snapshot → Report Preview → Report Artifact → Document Output → Template → Notification/Recommendation → Review → Human Approval Binding → Generated Output → Read-only Audit → Synthetic Release Evidence → Operator UI Contract → Responsive Layout → Report Rendering Adapter → Synthetic Release Manifest → Application Shell → Navigation State → Preview/Download → Synthetic Operator Journey → Cross-Module Acceptance → UI Release Evidence → Command UX → Connectivity Safety → Notification Center → Evidence Acknowledgement → Synthetic Release Trace`

P13.1841–2040 hardens the operator-facing control loop. Mutating command UX requires explicit confirmation; offline and degraded connectivity remain read-only; notifications remain evidence-bound; acknowledgements retain the originating evidence identity; the release trace remains synthetic and non-production.

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

Read models, dashboard views, workbench navigation, operational boards, reporting workspace, timelines, notifications, report previews, report artifacts, document outputs, templates, dashboard state, UI contracts, rendering adapters, application shell, navigation state, notification center and release traces remain derived/control state. Committed operational evidence remains authoritative and rebuildable.

Offline/degraded state never becomes an authorization bypass. Command UX confirmation is a usability guard, not a replacement for authoritative authorization and transaction controls.

## Current Gate

**P13.2040 — COMMAND UX / OFFLINE SAFETY / NOTIFICATION / RELEASE TRACE CONTRACT-READY / EXECUTION-CERTIFICATION PENDING**

Regression coverage has been added for mutation confirmation, offline read-only behavior, evidence-bound acknowledgement and synthetic release-trace invariants. Observable GitHub execution telemetry remains unavailable in this work session, so these controls are not certified as executed.

## Execution Certification Rule

CI or local execution may be certified only from observable command/job telemetry. `NOT_RUN`, missing evidence, non-zero exit codes, target mismatch, identity drift, or missing output identity remain blocked. No CI PASS, database PASS, production readiness, or operational authorisation is claimed.

## Next Gate

**P13.2041–P13.2280 — operator error/recovery UX, local-first synchronization contract, audit-event correlation, and synthetic resilience acceptance.**

No production or live-database step is implied by this next gate.
