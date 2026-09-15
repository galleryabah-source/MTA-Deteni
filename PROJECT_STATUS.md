# MTA DETENI — Project Status

**Version:** Foundation v1.46
**Current Phase:** P13.2201–P13.2440 local-device continuity, sync queue integrity, backup/restore evidence and synthetic multi-device acceptance
**Implementation Track:** P13.2440
**Branch:** `phase-p12.961-13.200`

## Latest Progress

- P13.2201–P13.2240 — local-device runtime packaging contract;
- P13.2241–P13.2280 — fail-closed synchronization queue integrity;
- P13.2281–P13.2320 — backup/restore evidence contract;
- P13.2321–P13.2360 — synthetic multi-device acceptance;
- P13.2361–P13.2400 — continuity release gate;
- P13.2401–P13.2440 — continuity documentation and synthetic regression coverage.

## Integrated Application Model

RAP owns registration, administration and reporting; PERKES owns health records and health workflows; KAMTIB owns placement, movement, headcount, temporary exit, escort and operational QR; SUBBAG TU owns escort document administration; HEAD RUDENIM has oversight, read-only operational visibility and authority for petunjuk, arahan, rekomendasi and disposisi without direct operational editing.

## Operational Application Chain

`UI/API Command → Authorization Policy → Canonical Operational Envelope → Domain Aggregate → Transaction Context → Idempotency → Domain Workflow → Immutable Timeline/Audit → Operational Evidence → Reconciliation → Outbox → Projection Checkpoint → Read Model → Dashboard/Workbench/Navigation → QR/Movement/Headcount/Temporary Exit → Reporting Workspace/Timeline → Reporting Snapshot → Report Preview → Report Artifact → Document Output → Template → Notification/Recommendation → Review → Human Approval Binding → Generated Output → Read-only Audit → Synthetic Release Evidence → Operator UI Contract → Responsive Layout → Report Rendering Adapter → Synthetic Release Manifest → Application Shell → Navigation State → Preview/Download → Synthetic Operator Journey → Cross-Module Acceptance → UI Release Evidence → Command UX → Connectivity Safety → Notification Center → Evidence Acknowledgement → Synthetic Release Trace → Error Recovery → Local-First Sync → Audit Correlation → Resilience Acceptance → Local Device Runtime → Sync Queue Integrity → Backup/Restore Evidence → Multi-Device Acceptance → Continuity Gate`

P13.2201–2440 establishes the contract foundation for a local PC/server continuity model in which tablet and smartphone clients can operate through the same local network when internet access is interrupted. Local operation is continuity only; it does not create new authority or bypass authorization.

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

Read models, dashboard views, workbench navigation, operational boards, reporting workspace, timelines, notifications, report previews, report artifacts, document outputs, templates, dashboard state, UI contracts, rendering adapters, application shell, navigation state, notification center, release traces, resilience state, local-device runtime state, sync queue state, backup evidence and multi-device acceptance remain derived/control state. Committed operational evidence remains authoritative and rebuildable.

Local-first synchronization is a continuity mechanism, not an authorization mechanism. Conflicts are fail-closed. Queue items cannot commit unless explicitly completed. Backup restore is promotable only when verification is explicitly VERIFIED.

## Current Gate

**P13.2440 — LOCAL-DEVICE CONTINUITY / SYNC QUEUE / BACKUP-RESTORE / MULTI-DEVICE ACCEPTANCE CONTRACT-READY / EXECUTION-CERTIFICATION PENDING**

Synthetic regression coverage has been added for local device classes, failed queue blocking, verified restore evidence and PC/tablet/smartphone acceptance. Observable GitHub execution telemetry remains unavailable in this work session, so these controls are not certified as executed.

## Execution Certification Rule

CI or local execution may be certified only from observable command/job telemetry. `NOT_RUN`, missing evidence, non-zero exit codes, target mismatch, identity drift, or missing output identity remain blocked. No CI PASS, database PASS, production readiness, or operational authorisation is claimed.

## Next Gate

**P13.2441–P13.2680 — local server bootstrap contract, LAN client discovery, durable sync journal, and controlled backup rotation.**

No production or live-database step is implied by this next gate.
