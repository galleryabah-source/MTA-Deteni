# MTA DETENI — Project Status

**Version:** Foundation v1.7
**Current Phase:** D3/D4/D5/D6 implementation + domain verification foundation
**Implementation Track:** P10.480
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
- P10.480 repository CI harness added for Node 24 typecheck and regression/domain tests.

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

**P10.480 — Domain Verification + CI Foundation: IN PROGRESS / VERIFICATION REQUIRED**

The repository now has service-contract tests, fail-closed idempotency boundaries, transaction/audit/outbox ports, governed temporary-exit orchestration, document template/numbering/approval binding contracts, and a GitHub Actions CI harness. Earlier CI attempts failed before meaningful code verification because the workflow enabled npm dependency caching without a committed lockfile; the cache prerequisite has now been removed. The latest CI run must be observed before claiming typecheck/test PASS.

## Next Checkpoints

1. P10.481–P10.488 — resolve and verify CI/typecheck findings;
2. P10.489–P10.496 — persistence adapter interfaces and optimistic-concurrency semantics;
3. P10.497–P10.504 — append-only audit/event and outbox adapter contracts;
4. P10.505–P10.512 — application composition/E2E synthetic execution harness;
5. P10.513+ — non-production runtime adapter, still migration-frozen until governance gate.
