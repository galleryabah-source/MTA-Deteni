# MTA DETENI — Project Status

**Version:** Foundation v1.14
**Current Phase:** P10.641–P10.648 CI + controlled verification hardening
**Implementation Track:** P10.648
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
- P10.609–P10.615 NodeNext import/declaration consistency hardened;
- P10.616–P10.620 runtime/read-model, reporting-export and transport guards added;
- P10.633–P10.640 controlled evidence gate formalized;
- P10.641 CI action versions/install behavior hardened for Node 24 verification.

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

**P10.648 — CI HARDENING COMPLETE; AUTOMATED VERIFICATION STILL NOT CLAIMED**

The CI workflow now uses stable action major versions and deterministic dependency-install flags. Automated runs observed in this environment still terminate as failures without executable step telemetry, so no PASS is claimed. The codebase remains migration-frozen and production-isolated.

## Next Gate

**P10.649+ — CI execution observability/evidence transport hardening, then controlled non-production verification harness.** Any real target requires explicit governance clearance and an approved non-production target; otherwise work remains synthetic.
