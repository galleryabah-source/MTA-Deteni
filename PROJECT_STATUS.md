# MTA DETENI — Project Status

**Version:** Foundation v1.40
**Current Phase:** P13.1041–P13.1240 document/output, approval, audit and cross-domain acceptance
**Implementation Track:** P13.1240
**Branch:** `phase-p12.961-13.200`

## Latest Progress

- P12.1121–P12.1360 domain, reconciliation, reporting and controlled operator surface;
- P13.361–P13.600 controlled application surface;
- P13.601–P13.660 controlled operator workbench;
- P13.661–P13.720 role-scoped navigation contract;
- P13.721–P13.780 QR verification surface contract;
- P13.781–P13.820 movement/headcount operational board;
- P13.821–P13.840 synthetic end-to-end acceptance composition;
- P13.841–P13.900 controlled reporting workspace;
- P13.901–P13.960 immutable operator timeline composition;
- P13.961–P13.1000 notification/recommendation boundaries;
- P13.1001–P13.1040 integrated synthetic regression boundary;
- P13.1041–P13.1100 controlled document output workspace;
- P13.1101–P13.1160 exact approval-to-artifact/evidence binding;
- P13.1161–P13.1200 role-scoped read-only operational audit view;
- P13.1201–P13.1240 cross-domain synthetic acceptance boundary.

## Integrated Application Model

RAP owns registration, administration and reporting; PERKES owns health records and health workflows; KAMTIB owns placement, movement, headcount, temporary exit, escort and operational QR; SUBBAG TU owns escort document administration; HEAD RUDENIM has oversight, read-only operational visibility and authority for petunjuk, arahan, rekomendasi and disposisi without direct operational editing.

## Operational Application Chain

`UI/API Command → Authorization Policy → Canonical Operational Envelope → Domain Aggregate → Transaction Context → Idempotency → Domain Workflow → Immutable Timeline/Audit → Operational Evidence → Reconciliation → Outbox → Projection Checkpoint → Read Model → Dashboard/Workbench/Navigation → QR/Movement/Headcount/Temporary Exit → Reporting Workspace/Timeline → Reporting Snapshot → Report Preview → Report Artifact → Document Output → Notification/Recommendation → Review → Human Approval Binding → Generated Output → Read-only Audit`

P13.1041–1240 hardens output provenance and approval integrity, keeps audit views read-only and role scoped, and introduces a cross-domain synthetic acceptance boundary. These are derived/control surfaces and do not replace authoritative evidence or authorization.

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

Read models, dashboard views, workbench navigation, operational boards, reporting workspace, timelines, notifications, report previews, report artifacts and document outputs remain derived state. Committed operational evidence remains authoritative and rebuildable.

Approval is human-bound to the exact artifact/report/evidence fingerprint. Cross-domain acceptance is synthetic and governance-gated; it does not authorize production execution.

## Current Gate

**P13.1240 — DOCUMENT / APPROVAL / AUDIT / CROSS-DOMAIN ACCEPTANCE CONTRACT-READY / EXECUTION-CERTIFICATION PENDING**

Executable regression coverage has been added for document content drift, exact approval binding, role-scoped read-only audit access and governance-safe cross-domain acceptance. Observable GitHub execution telemetry remains unavailable in this work session, so these controls are not certified as executed.

## Execution Certification Rule

CI or local execution may be certified only from observable command/job telemetry. `NOT_RUN`, missing evidence, non-zero exit codes, target mismatch, identity drift, or missing output identity remain blocked. No CI PASS, database PASS, production readiness, or operational authorisation is claimed.

## Next Gate

**P13.1241–P13.1440 — presentation-ready reporting pipeline, document template contract, operational dashboard state model, and stronger synthetic release evidence.**

No production or live-database step is implied by this next gate.
