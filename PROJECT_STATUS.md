# MTA DETENI — Project Status

**Version:** Foundation v1.11
**Current Phase:** P10.577–P10.608 pilot, transport, responsive read-model and reporting contract foundation
**Implementation Track:** P10.608
**Branch:** `main`

## Latest Progress

- P10.577–P10.584 controlled pilot-readiness evidence model and fail-closed certification contract added;
- P10.585–P10.592 API/application transport contract added with route policy, correlation, idempotency and audit requirements;
- P10.593–P10.600 responsive operator read-model contract added with deny-by-default role access;
- P10.601–P10.608 regu jaga reporting/export contract added with provenance, required sections, document numbering and approval binding;
- synthetic regression coverage added for all four checkpoint groups.

## Integrated Application Boundaries

**RAP:** registrasi, administrasi, pelaporan, initial data/documents, requests, detainee-property administration, notifications, administrative recommendations.

**PERKES:** initial examination, health records/history, health scheduling/notifications, medical recommendations, food/goods needs related to health.

**KAMTIB:** operational control, placement, movement, headcount, temporary exit process, escort operations, barcode/QR, block/room lists, operational notifications and recommendations.

**SUBBAG TU:** assignment letters for Rudenim personnel escorting temporary exits, registration/numbering, document generation, distribution, and archiving within authority.

**HEAD RUDENIM:** overall visibility and timeline oversight, read-only operational records, authority for petunjuk, arahan, rekomendasi, and disposisi; no direct operational editing through oversight functions.

## Safety / Governance Boundary

- Migration Freeze: **TRUE**;
- AI: **OFF**;
- Repository data: **SYNTHETIC ONLY**;
- Production access: **NOT AUTHORIZED**;
- Live PostgreSQL execution: **NOT AUTHORIZED without explicit governance clearance and approved non-production target**;
- no real detainee data, credentials, health records, WhatsApp exports, or production PII in GitHub;
- no autonomous AI decision-making;
- no direct WhatsApp/OCR/transcript → approved operational record;
- no schema migration before approved data model, security controls, reconciliation, and governance gate.

## Current Gate

**P10.608 — CONTRACT READY; LIVE INTEGRATION STILL GOVERNANCE-BLOCKED**

The application now has a coherent contract layer from pilot evidence through transport, read models and operational reporting. This is not a production deployment and does not claim CI PASS. No database driver, live connection, migration, or external operational ingestion has been enabled.

## Next Checkpoint

**P10.609+ — controlled non-production integration only after explicit governance clearance and an approved target.** The first integration sequence must be read-only schema/RLS reconciliation, followed by guarded persistence execution, then API/runtime verification, with migration still frozen unless explicitly approved.
