# MTA DETENI — Project Status

**Version:** Foundation v1.13
**Current Phase:** P10.609–P10.640 controlled integration + verification evidence foundation
**Implementation Track:** P10.640
**Branch:** `main`

## Latest Progress

- P10.577–P10.584 pilot-readiness evidence and fail-closed certification contract;
- P10.585–P10.592 API/application transport contract with authorization, correlation, idempotency and audit requirements;
- P10.593–P10.600 responsive operator read-model contract with deny-by-default role access;
- P10.601–P10.608 regu jaga reporting/export contract with provenance, required sections, document numbering and approval binding;
- P10.609–P10.616 controlled target + schema/RLS reconciliation gate contract;
- P10.617–P10.624 guarded persistence execution contract;
- P10.625–P10.632 API/runtime verification contract and synthetic E2E gate;
- P10.633–P10.640 formal controlled verification evidence gate and fail-closed regression tests;
- P10.609–P10.615 NodeNext import/declaration consistency hardened across the application/domain TypeScript boundary;
- P10.616 runtime/read-model integration guard added;
- P10.617–P10.618 governed reporting export and transport authorization/idempotency guards added;
- P10.619–P10.620 integration/report export regression tests added.

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

## Current Gate

**P10.640 — CONTROLLED VERIFICATION EVIDENCE GATE READY; LIVE EXECUTION BLOCKED**

The application now has a fail-closed evidence model covering target authorization, read-only schema/RLS reconciliation, persistence concurrency, audit/outbox, API authorization, runtime readiness and synthetic E2E. A complete synthetic packet can be evaluated as READY, while missing, failed, or target-inconsistent evidence remains BLOCKED. No live database or production integration has been executed.

## Next Gate

**P10.641+ — controlled non-production execution harness implementation.** The next execution sequence remains read-only target authorization/reconciliation first, followed by guarded persistence and API/runtime verification. Migration stays frozen.
