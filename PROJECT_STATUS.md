# MTA DETENI — Project Status

**Version:** Foundation v1.28
**Current Phase:** P11.961–P12.120 controlled application composition
**Implementation Track:** P12.120
**Branch:** `main`

## Latest Progress

- P11.161–P11.224 temporary-exit lifecycle consistency;
- P11.225–P11.288 placement/movement/headcount and operational QR consistency;
- P11.289–P11.352 synthetic cross-domain E2E and failure-path regression;
- P11.353–P11.448 placement/movement/headcount reconciliation contract;
- P11.449–P11.544 operational QR validity-window and explicit context compatibility contract;
- P11.545–P11.608 cross-domain detainee/placement/headcount aggregate composition;
- P11.609–P11.680 reporting snapshot consistency;
- P11.681–P11.816 integrated synthetic failure-path matrix;
- P11.817–P11.872 immutable operational timeline composition;
- P11.873–P11.904 audit/outbox correlation binding;
- P11.905–P11.936 idempotency-aware mutation identity;
- P11.937–P11.960 synthetic authorization regression;
- P11.961–P11.1024 transactional mutation orchestration;
- P11.1025–P11.1088 operator command/read surface;
- P11.1089–P11.1160 temporary-exit command adapter to canonical workflow;
- P11.1161–P12.120 command-to-read-model application composition.

## Integrated Application Model

RAP owns registration, administration and reporting; PERKES owns health records and health workflows; KAMTIB owns placement, movement, headcount, temporary exit, escort and operational QR; SUBBAG TU owns escort assignment/document administration; HEAD RUDENIM has oversight, read-only operational visibility and authority for petunjuk, arahan, rekomendasi and disposisi without direct operational editing.

## Operational Application Chain

`UI/API Command → Authorization → Transaction → Idempotency → Domain Workflow → Immutable Timeline/Audit → Outbox → Read Model → QR/Movement/Temporary Exit → Reporting`

Operator commands now carry command identity, actor context, permission, fingerprint and payload. Temporary-exit commands are routed through `MtaWorkflowService`; the application facade projects successful mutation envelopes into the operator read-model boundary.

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

The application layer now has a contract-level composition from authorized operator command through transactional mutation and evidence to read-model projection. Concrete persistence adapters must preserve the same transaction context across domain mutation, audit, outbox and idempotency completion.

## Current Gate

**P12.120 — CONTROLLED APPLICATION COMPOSITION CONTRACT-READY / EXECUTION TELEMETRY STILL REQUIRED**

Static tests were added for transactional ordering, replay/conflict behavior, temporary-exit command routing, and mutation-to-read-model projection. These controls are not execution-certified until observable CI or authorized local telemetry is available.

## Execution Certification Rule

CI or local execution may be certified only from observable command/job telemetry. `NOT_RUN`, missing evidence, non-zero exit codes, target mismatch, identity drift, or missing output identity remain blocked. No CI PASS, database PASS, production readiness, or operational authorisation is claimed.

## Next Gate

**P12.121 onward — concrete non-production adapters: shared transaction context, persistent idempotency, atomic audit/outbox persistence, explicit authorization policy matrix, then operator UI/API integration.**

No production or live-database step is implied by this next gate.
