# MTA DETENI — Project Status

**Version:** Foundation v1.48
**Current Phase:** P13.2681–P13.2880 offline session, client pairing, sync replay integrity and synthetic disaster recovery
**Implementation Track:** P13.2880
**Branch:** `phase-p12.961-13.200`

## Latest Progress

- P13.2681–P13.2720 — offline session safety boundary;
- P13.2721–P13.2760 — controlled client pairing;
- P13.2761–P13.2800 — deterministic sync replay ordering;
- P13.2801–P13.2840 — integrity checksum boundary;
- P13.2841–P13.2880 — synthetic disaster-recovery rehearsal.

## Integrated Application Model

RAP owns registration, administration and reporting; PERKES owns health records and health workflows; KAMTIB owns placement, movement, headcount, temporary exit, escort and operational QR; SUBBAG TU owns escort document administration; HEAD RUDENIM has oversight, read-only operational visibility and authority for petunjuk, arahan, rekomendasi and disposisi without direct operational editing.

## Operational Application Chain

`UI/API Command → Authorization Policy → Canonical Operational Envelope → Domain Aggregate → Transaction Context → Idempotency → Domain Workflow → Immutable Timeline/Audit → Operational Evidence → Reconciliation → Outbox → Projection Checkpoint → Read Model → Dashboard/Workbench/Navigation → QR/Movement/Headcount/Temporary Exit → Reporting Workspace/Timeline → Reporting Snapshot → Report Preview → Report Artifact → Document Output → Template → Notification/Recommendation → Review → Human Approval Binding → Generated Output → Read-only Audit → Synthetic Release Evidence → Operator UI Contract → Responsive Layout → Report Rendering Adapter → Synthetic Release Manifest → Application Shell → Navigation State → Preview/Download → Synthetic Operator Journey → Cross-Module Acceptance → UI Release Evidence → Command UX → Connectivity Safety → Notification Center → Evidence Acknowledgement → Synthetic Release Trace → Error Recovery → Local-First Sync → Audit Correlation → Resilience Acceptance → Local Device Runtime → Sync Queue Integrity → Backup/Restore Evidence → Multi-Device Acceptance → Continuity Gate → Local Server Bootstrap → LAN Client Discovery → Durable Sync Journal → Controlled Backup Rotation → Continuity Runtime Gate → Offline Session → Client Pairing → Sync Replay → Integrity Checksum → Disaster Recovery Rehearsal`

P13.2681–2880 strengthens the continuity model with explicit offline-session boundaries, pairing, deterministic replay, integrity verification and a synthetic disaster-recovery rehearsal. Offline operation remains read-only unless the canonical online authorization boundary is available; pairing is controlled; replay ordering is deterministic; checksum mismatch is fail-closed; recovery rehearsal remains synthetic and requires human sign-off.

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

Read models, dashboard views, workbench navigation, operational boards, reporting workspace, timelines, notifications, report previews, report artifacts, document outputs, templates, dashboard state, UI contracts, rendering adapters, application shell, navigation state, notification center, release traces, resilience state, local-device runtime state, sync queue state, backup evidence, multi-device acceptance, local server state, LAN discovery, synchronization journal, offline sessions, pairings, replay state, integrity envelopes and disaster-recovery rehearsal state remain derived/control state. Committed operational evidence remains authoritative and rebuildable.

Offline sessions do not create authority. Client pairing does not create authority. Replay does not create authority. Integrity verification protects evidence transport but does not replace authorization. Disaster recovery requires explicit human sign-off and never authorizes production access.

## Current Gate

**P13.2880 — OFFLINE SESSION / CLIENT PAIRING / SYNC REPLAY / INTEGRITY / SYNTHETIC DR CONTRACT-READY / EXECUTION-CERTIFICATION PENDING**

Synthetic regression coverage has been added for offline mutation blocking, paired-client acceptance, contiguous replay, checksum verification and disaster-recovery rehearsal. Observable GitHub execution telemetry remains unavailable in this work session, so these controls are not certified as executed.

## Execution Certification Rule

CI or local execution may be certified only from observable command/job telemetry. `NOT_RUN`, missing evidence, non-zero exit codes, target mismatch, identity drift, or missing output identity remain blocked. No CI PASS, database PASS, production readiness, or operational authorisation is claimed.

## Next Gate

**P13.2881–P13.3120 — continuity session lifecycle, device revocation, sync conflict resolution contract, evidence chain sealing, and synthetic end-to-end continuity acceptance.**

No production or live-database step is implied by this next gate.
