# MTA DETENI — Project Status

**Version:** Foundation v1.11
**Current Phase:** P10.577–P10.608 pilot, transport, responsive read-model and reporting contract foundation
**Implementation Track:** P10.608
**Branch:** `main`

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
- P10.237–P10.244 MVP domain implementation gate established;
- P10.245–P10.252 core administration contract established;
- P10.253–P10.260 placement contract established;
- P10.261–P10.268 movement/headcount contract established;
- P10.269–P10.276 temporary-exit contract established;
- P10.277–P10.284 escort contract established;
- P10.285–P10.292 document-engine contract established;
- P10.293–P10.300 approval/leadership contract established;
- P10.301–P10.308 MVP integration test gate established;
- P10.309–P10.316 core administration implementation scaffold established;
- P10.317–P10.324 placement implementation scaffold established;
- P10.325–P10.332 movement/headcount implementation scaffold established;
- P10.333–P10.340 temporary-exit implementation scaffold established;
- P10.341–P10.348 escort implementation scaffold established;
- P10.349–P10.356 document-engine implementation scaffold established;
- P10.357–P10.364 approval/leadership implementation scaffold established;
- P10.365–P10.372 integrated synthetic test matrix established;
- P10.373–P10.380 shared domain types/error taxonomy/command-result contracts established;
- P10.381–P10.388 synthetic fixture factory and deterministic state-machine tests established;
- P10.389–P10.396 core administration service foundation implemented;
- P10.397–P10.404 placement service foundation implemented;
- P10.405–P10.412 movement/headcount service foundation implemented;
- P10.413–P10.420 temporary-exit service foundation implemented;
- P10.421–P10.428 escort service foundation implemented and hardened;
- P10.429–P10.436 document-engine artifact service foundation implemented;
- P10.437–P10.444 approval/leadership service foundation implemented with separation-of-duties guard;
- P10.445 application workflow composition boundary established;
- P10.446 minimal TypeScript project manifest established;
- P10.447 strict TypeScript compiler contract established;
- P10.448–P10.455 synthetic TypeScript service-contract tests added;
- P10.456–P10.463 idempotency, authorization, transaction, audit/outbox and failure-semantics ports established;
- P10.464–P10.471 governed temporary-exit orchestration added with approval/document/escort prerequisites and stale-state protection;
- P10.472–P10.479 document template effectiveness, required-field, numbering and approval-binding contracts added;
- P10.480 CI harness added for Node 24 typecheck and regression/domain tests;
- P10.481–P10.488 CI diagnosis remains open because GitHub Actions jobs are failing before exposing executable step telemetry in this repository environment;
- P10.489–P10.496 versioned persistence contracts and optimistic-concurrency adapter semantics added;
- P10.497–P10.504 append-only audit/event and outbox persistence contracts plus deterministic in-memory adapters added;
- P10.505–P10.512 synthetic end-to-end temporary-exit execution harness added;
- P10.513–P10.520 CI verification boundary documented; no CI PASS claimed;
- P10.521–P10.528 application composition boundary reaffirmed for canonical temporary-exit orchestration;
- P10.529–P10.536 synthetic persistence contract tests added for stale writes, append-only events, outbox replay/duplicate handling, claim and acknowledgement;
- P10.537–P10.544 runtime readiness and safe configuration contracts/tests added;
- P10.545–P10.552 guarded non-production PostgreSQL boundary contract added;
- P10.553–P10.560 schema/RLS reconciliation remains gated on an approved non-production target;
- P10.561–P10.568 persistence integration requirements documented around existing transaction/idempotency/audit/outbox boundaries;
- P10.569–P10.576 runtime integration requirements documented with fail-closed health/readiness boundary;
- P10.577–P10.584 controlled pilot-readiness evidence model and fail-closed certification contract added;
- P10.585–P10.592 API/application transport contract added with route policy, correlation, idempotency and audit requirements;
- P10.593–P10.600 responsive operator read-model contract added with deny-by-default role access;
- P10.601–P10.608 regu jaga reporting/export contract added with provenance, required sections, document numbering and approval binding;
- synthetic regression coverage added for all four checkpoint groups.

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

**P10.608 — CONTRACT READY; LIVE INTEGRATION STILL GOVERNANCE-BLOCKED**

The application now has a coherent contract layer from pilot evidence through transport, read models and operational reporting. This is not a production deployment and does not claim CI PASS. No database driver, live connection, migration, or external operational ingestion has been enabled.

## Next Checkpoint

**P10.609+ — controlled non-production integration only after explicit governance clearance and an approved target.** The first integration sequence must be read-only schema/RLS reconciliation, followed by guarded persistence execution, then API/runtime verification, with migration still frozen unless explicitly approved.
