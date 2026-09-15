# MTA DETENI — Project Status

**Version:** Foundation v1.36
**Current Phase:** P12.961–P12.1120 end-to-end aggregate, reconciliation and operator workflow
**Implementation Track:** P12.1120
**Branch:** `main`

## Latest Progress

- P12.961–P12.1000 domain aggregate composition;
- P12.1001–P12.1040 reconciliation evidence contract;
- P12.1041–P12.1080 deterministic report-generation contract;
- P12.1081–P12.1120 controlled operator workflow surface.

## Integrated Application Model

RAP owns registration, administration and reporting; PERKES owns health records and health workflows; KAMTIB owns placement, movement, headcount, temporary exit, escort and operational QR; SUBBAG TU owns escort document administration; HEAD RUDENIM has oversight, read-only operational visibility and authority for petunjuk, arahan, rekomendasi and disposisi without direct operational editing.

## Operational Application Chain

`UI/API Command → Authorization Policy → Canonical Operational Envelope → Domain Aggregate → Transaction Context → Idempotency → Domain Workflow → Immutable Timeline/Audit → Operational Evidence → Reconciliation → Outbox → Projection Checkpoint → Read Model → QR/Movement/Temporary Exit → Reporting Snapshot → Review/Approval → Generated Artifact`

The aggregate composition preserves detainee and aggregate identity across domains. Reconciliation now produces explicit MATCH/MISMATCH evidence. Report generation is snapshot-bound and deterministic. The operator surface enforces DRAFT → VALIDATED → PREVIEW → REVIEW → APPROVED → GENERATED and rejects skipped stages.

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

QR remains an operational verification point. Temporary-exit QR evidence is bound to the detainee and temporary-exit identity and validity window; deportation uses a separate context.

A reconciliation mismatch is preserved as explicit evidence and is not silently normalized to success.

Leadership remains limited to oversight-read and directive permissions and is denied direct operational mutation permissions.

Read models and reporting snapshots remain derived state. Committed operational evidence remains authoritative and remains the basis for rebuilding downstream projections.

## Current Gate

**P12.1120 — END-TO-END CONTRACT-READY / EXECUTION-CERTIFICATION PENDING**

Synthetic regression coverage was added for aggregate identity, reconciliation mismatch preservation, deterministic report generation and governed operator transitions. GitHub execution telemetry remains unavailable, so these controls are not certified as executed.

## Execution Certification Rule

CI or local execution may be certified only from observable command/job telemetry. `NOT_RUN`, missing evidence, non-zero exit codes, target mismatch, identity drift, or missing output identity remain blocked. No CI PASS, database PASS, production readiness, or operational authorisation is claimed.

## Next Gate

**P12.1121–P13.240 — domain-specific aggregate policies, reconciliation blocking rules, report artifact contract and UI/API adapter hardening.**

No production or live-database step is implied by this next gate.
