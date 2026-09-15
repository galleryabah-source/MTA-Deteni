# MTA DETENI — Project Status

**Version:** Foundation v1.50
**Current Phase:** P13.3121–P13.3320 data-contract audit, cross-domain invariants, report-template fidelity and synthetic certification preparation
**Implementation Track:** P13.3320
**Branch:** `phase-p12.961-13.200`

## Latest Progress

- P13.2881–P13.2920 — continuity session lifecycle;
- P13.2921–P13.2960 — fail-closed device revocation;
- P13.2961–P13.3000 — deterministic sync conflict resolution;
- P13.3001–P13.3040 — evidence chain sealing;
- P13.3041–P13.3080 — synthetic continuity end-to-end acceptance;
- P13.3081–P13.3120 — continuity release gate;
- P13.3121–P13.3160 — cross-domain operational invariants;
- P13.3161–P13.3200 — operational data-contract audit boundary;
- P13.3201–P13.3240 — report-template fidelity contract;
- P13.3241–P13.3280 — synthetic integration certification contract;
- P13.3281–P13.3320 — production authorization barrier.

## Integrated Application Model

RAP owns registration, administration and reporting; PERKES owns health records and health workflows; KAMTIB owns placement, movement, headcount, temporary exit, escort and operational QR; SUBBAG TU owns escort document administration; HEAD RUDENIM has oversight, read-only operational visibility and authority for petunjuk, arahan, rekomendasi and disposisi without direct operational editing.

## Operational Chain

`UI/API Command → Authorization Policy → Canonical Operational Envelope → Domain Aggregate → Transaction Context → Idempotency → Domain Workflow → Immutable Timeline/Audit → Operational Evidence → Reconciliation → Outbox → Projection Checkpoint → Read Model → Dashboard/Workbench/Navigation → QR/Movement/Headcount/Temporary Exit → Reporting Workspace/Timeline → Reporting Snapshot → Report Preview → Report Artifact → Document Output → Template → Notification/Recommendation → Review → Human Approval Binding → Generated Output → Read-only Audit → Synthetic Release Evidence → Operator UI Contract → Responsive Layout → Report Rendering Adapter → Synthetic Release Manifest → Application Shell → Navigation State → Preview/Download → Synthetic Operator Journey → Cross-Module Acceptance → UI Release Evidence → Command UX → Connectivity Safety → Notification Center → Evidence Acknowledgement → Synthetic Release Trace → Error Recovery → Local-First Sync → Audit Correlation → Resilience Acceptance → Local Device Runtime → Sync Queue Integrity → Backup/Restore Evidence → Multi-Device Acceptance → Continuity Gate → Local Server Bootstrap → LAN Client Discovery → Durable Sync Journal → Controlled Backup Rotation → Continuity Runtime Gate → Offline Session → Client Pairing → Sync Replay → Integrity Checksum → Disaster Recovery Rehearsal → Continuity Session Lifecycle → Device Revocation → Sync Conflict Resolution → Evidence Chain Sealing → Synthetic Continuity E2E → Continuity Release Gate → Cross-Domain Invariants → Operational Data Contract → Report Template Fidelity → Synthetic Certification → Production Barrier`

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

- Temporary-exit `COMPLETED` is not a deportation event; deportation remains a separate operational workflow and QR context.
- QR is an operational verification point, not a free-form data-entry path; validity remains contextual and window constrained.
- Leadership remains oversight-read/directive only and is denied direct operational mutation.
- Offline sessions do not create authority; client pairing does not create authority; replay does not create authority.
- Device revocation is fail-closed and blocks continued continuity use.
- Sync conflicts are never silently resolved by last-write-wins; human review is required.
- Evidence-chain sealing occurs only after integrity verification.
- Report fidelity is represented as a contract with source-field mapping and deterministic element order; exact visual reproduction still requires the approved source template and execution evidence.
- Certification contracts require observable execution evidence; source-code presence alone is not certification.

## Current Gate

**P13.3320 — CROSS-DOMAIN INVARIANTS / DATA-CONTRACT AUDIT / REPORT-TEMPLATE FIDELITY / SYNTHETIC CERTIFICATION / PRODUCTION-BARRIER CONTRACT-READY / EXECUTION-CERTIFICATION PENDING**

Synthetic regression coverage has been added for the new invariant and certification boundaries. Observable GitHub execution telemetry is not being represented as PASS unless actually available.

## Execution Certification Rule

CI or local execution may be certified only from observable command/job telemetry. `NOT_RUN`, missing evidence, non-zero exit codes, target mismatch, identity drift, or missing output identity remain blocked. No CI PASS, database PASS, production readiness, or operational authorisation is claimed.

## Next Gate

**P13.3321–P13.3560 — synthetic contract integration matrix, report source-field reconciliation, QR/movement/temporary-exit cross-domain acceptance, and pre-certification evidence bundle.**

No production or live-database step is implied by this next gate.
