# MTA DETENI — Project Status

**Version:** Foundation v1.2
**Current Phase:** D3/D4 implementation preparation
**Implementation Track:** P10.244
**Branch:** `main`

## Completed Foundation

- repository initialized;
- MTA DETENI naming established;
- PKP governance positioning documented;
- master blueprint and requirements baselines established;
- roadmap D0–D10 established;
- security/privacy principles established;
- synthetic-data-only repository boundary established;
- RBAC/ABAC authority matrix and domain boundaries established;
- leadership petunjuk/arah/rekomendasi/disposisi layer documented;
- AS-IS → TO-BE process baseline documented;
- temporary-exit → escort → assignment-letter chain documented;
- acceptance criteria baseline established.

## Implementation / Verification Progress

- P9 implementation kernel contracts established;
- P10.133–P10.140 governed PostgreSQL verification readiness established;
- P10.173–P10.180 non-production evidence packet established;
- P10.181–P10.188 execution preflight established;
- P10.189–P10.196 controlled non-production verification execution contract established;
- P10.197–P10.204 preflight/evidence consistency gate established;
- P10.205–P10.212 read-only schema/RLS reconciliation established;
- P10.213–P10.220 controlled non-production execution harness contract established;
- P10.221–P10.228 PostgreSQL verification evidence contract established;
- P10.229–P10.236 certification and pilot-readiness gate established;
- P10.237–P10.244 MVP domain implementation gate established.

## Current Governance Model

**RAP:** registrasi, administrasi, pelaporan, initial data/documents, requests, detainee-property administration, notifications, administrative recommendations.

**PERKES:** initial examination, health records/history, health scheduling/notifications, medical recommendations, food/goods needs related to health.

**KAMTIB:** operational control, placement, movement, headcount, temporary exit process, escort operations, barcode/QR, block/room lists, operational notifications and recommendations.

**SUBBAG TU:** administrative handling of assignment letters for Rudenim personnel escorting temporary exits, registration/numbering, document generation, distribution, and archiving within its authority.

**HEAD RUDENIM:** overall visibility and timeline oversight, read-only on operational records, with authority to issue petunjuk, arahan, rekomendasi, and disposisi. No direct operational editing through oversight functions.

## Active Safety Boundary

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

**P10.244 — MVP Domain Implementation Gate: PLANNING_READY**

The next implementation work begins with the kernel-backed core administration and detainee domain contracts. Each domain must define authority, state machine, validation, audit, idempotency, error taxonomy, synthetic fixtures, and tests before implementation.

## Next Checkpoints

1. P10.245–P10.252 — Core Administration / Detainee Contract;
2. P10.253–P10.260 — Placement / Block / Room / Bed Contract;
3. P10.261–P10.268 — Movement & Headcount Contract;
4. P10.269–P10.276 — Temporary Exit Contract;
5. P10.277–P10.284 — Escort Contract;
6. P10.285–P10.292 — Document Engine Contract;
7. P10.293–P10.300 — Approval & Leadership Contract;
8. then implementation/test evidence follows the approved dependency order.
