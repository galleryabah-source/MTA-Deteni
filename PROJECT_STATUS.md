# MTA DETENI — Project Status

**Version:** Foundation v1.27
**Current Phase:** P11.817–P11.960 operational integrity gate
**Implementation Track:** P11.960
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
- P11.937–P11.960 synthetic authorization regression.

## Integrated Application Model

RAP owns registration, administration and reporting; PERKES owns health records and health workflows; KAMTIB owns placement, movement, headcount, temporary exit, escort and operational QR; SUBBAG TU owns escort assignment/document administration; HEAD RUDENIM has oversight, read-only operational visibility and authority for petunjuk, arahan, rekomendasi and disposisi without direct operational editing.

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

Operational mutations now have a contract-level integrity chain: authorization → idempotency → domain mutation → immutable timeline/audit → outbox → read model/report.

## Current Gate

**P11.960 — OPERATIONAL INTEGRITY CONTRACT-READY / EXECUTION TELEMETRY STILL REQUIRED**

The application boundary now explicitly models ordered operational history, audit/outbox correlation, replay-safe mutation identity, and deny-by-default authorization regression. These remain contract-level controls until observable execution evidence exists.

## Execution Certification Rule

CI or local execution may be certified only from observable command/job telemetry. `NOT_RUN`, missing evidence, non-zero exit codes, target mismatch, identity drift, or missing output identity remain blocked. No CI PASS, database PASS, production readiness, or operational authorisation is claimed.

## Next Gate

**P11.961–P12.120 — controlled application service composition, transactional mutation orchestration, audit/outbox atomicity contract, and operator-facing command/read-model integration.**

No production or live-database step is implied by this next gate.
