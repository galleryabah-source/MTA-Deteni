# MTA DETENI — Project Status

**Version:** Foundation v1.52
**Current Phase:** P13.3481–P13.3720 integrated synthetic journey and pre-certification
**Implementation Track:** P13.3720
**Branch:** `phase-p12.961-13.200`

## Latest Progress

- P13.3481–P13.3520 — full synthetic journey composition;
- P13.3521–P13.3560 — deterministic report artifact generation;
- P13.3561–P13.3600 — role/permission regression boundary;
- P13.3601–P13.3640 — offline-to-online reconciliation acceptance;
- P13.3641–P13.3680 — certification evidence packaging;
- P13.3681–P13.3720 — integrated pre-certification gate.

## Integrated Application Model

RAP owns registration, administration and reporting; PERKES owns health records and health workflows; KAMTIB owns placement, movement, headcount, temporary exit, escort and operational QR; SUBBAG TU owns escort document administration; HEAD RUDENIM has oversight, read-only operational visibility and authority for petunjuk, arahan, rekomendasi and disposisi without direct operational editing.

## Operational Chain

`UI/API Command → Authorization Policy → Canonical Operational Envelope → Domain Aggregate → Transaction Context → Idempotency → Domain Workflow → Immutable Timeline/Audit → Operational Evidence → Reconciliation → Outbox → Projection Checkpoint → Read Model → Dashboard/Workbench/Navigation → QR/Movement/Headcount/Temporary Exit → Reporting Workspace/Timeline → Reporting Snapshot → Report Preview → Report Artifact → Document Output → Template → Notification/Recommendation → Review → Human Approval Binding → Generated Output → Read-only Audit → Synthetic Release Evidence → Operator UI Contract → Responsive Layout → Report Rendering Adapter → Synthetic Release Manifest → Application Shell → Navigation State → Preview/Download → Synthetic Operator Journey → Cross-Module Acceptance → UI Release Evidence → Command UX → Connectivity Safety → Notification Center → Evidence Acknowledgement → Synthetic Release Trace → Error Recovery → Local-First Sync → Audit Correlation → Resilience Acceptance → Local Device Runtime → Sync Queue Integrity → Backup/Restore Evidence → Multi-Device Acceptance → Continuity Gate → Local Server Bootstrap → LAN Client Discovery → Durable Sync Journal → Controlled Backup Rotation → Continuity Runtime Gate → Offline Session → Client Pairing → Sync Replay → Integrity Checksum → Disaster Recovery Rehearsal → Continuity Session Lifecycle → Device Revocation → Sync Conflict Resolution → Evidence Chain Sealing → Synthetic Continuity E2E → Continuity Release Gate → Cross-Domain Invariants → Operational Data Contract → Report Template Fidelity → Synthetic Certification → Production Barrier → Synthetic Contract Matrix → Report Source Reconciliation → QR/Movement/Temporary-Exit Acceptance → Pre-Certification Evidence Bundle → Full Synthetic Journey → Report Artifact Determinism → Role/Permission Regression → Offline/Online Reconciliation → Certification Evidence Package → Pre-Certification Gate`

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
- Report artifacts are deterministic for the same template and source snapshot input.
- Role/permission regression remains deny-by-default at the contract boundary.
- Offline-to-online reconciliation requires exact version and operation-fingerprint agreement; mismatch remains blocked.
- Certification evidence requires observable execution evidence and output identity; `NOT_RUN` is never promoted to PASS.

## Current Gate

**P13.3720 — FULL SYNTHETIC JOURNEY / REPORT DETERMINISM / ROLE-PERMISSION REGRESSION / OFFLINE-ONLINE RECONCILIATION / CERTIFICATION EVIDENCE / PRE-CERTIFICATION CONTRACT-READY / EXECUTION-CERTIFICATION PENDING**

Synthetic tests have been added for the integrated journey, deterministic report artifacts, role/permission boundaries, reconciliation and certification evidence packaging. These are source-level test contracts; no execution PASS is claimed without observable telemetry.

## Execution Certification Rule

CI or local execution may be certified only from observable command/job telemetry. `NOT_RUN`, missing evidence, non-zero exit codes, target mismatch, identity drift, or missing output identity remain blocked. No CI PASS, database PASS, production readiness, or operational authorisation is claimed.

## Next Gate

**P13.3721–P13.3960 — synthetic test-harness execution, application-shell integration review, report-output fidelity implementation boundary, and release-candidate evidence assembly.**

No production or live-database step is implied by this next gate.
