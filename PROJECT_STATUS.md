# MTA DETENI — Project Status

**Version:** Foundation v1.25
**Current Phase:** P11.353–P11.544 data consistency and QR validity gate
**Implementation Track:** P11.544
**Branch:** `main`

## Latest Progress

- P11.161–P11.224 temporary-exit lifecycle consistency;
- P11.225–P11.288 placement/movement/headcount and operational QR consistency;
- P11.289–P11.352 synthetic cross-domain E2E and failure-path regression;
- P11.353–P11.448 placement/movement/headcount reconciliation contract;
- P11.449–P11.544 operational QR validity-window and explicit context compatibility contract.

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

## Design Integrity Finding Addressed

Temporary-exit `COMPLETED` is not treated as a deportation event. Deportation remains a separate operational QR context. This prevents accidental coupling between temporary-exit lifecycle completion and deportation workflow.

## Current Gate

**P11.544 — DATA CONSISTENCY / QR VALIDITY-WINDOW CONTRACT-READY / EXECUTION TELEMETRY STILL REQUIRED**

Cross-domain consistency is now represented at contract level for synthetic data: detainee identity → placement → movement events → headcount reconciliation, plus QR validity interval and context compatibility. This remains contract-level evidence only.

## Execution Certification Rule

CI or local execution may be certified only from observable command/job telemetry. `NOT_RUN`, missing evidence, non-zero exit codes, target mismatch, identity drift, or missing output identity remain blocked. No CI PASS, database PASS, production readiness, or operational authorisation is claimed.

## Next Gate

**P11.545–P11.680 — cross-domain aggregate composition, reconciliation ledger invariants, reporting snapshot consistency, and integrated synthetic failure-path matrix.**

No production or live-database step is implied by this next gate.
