# MTA DETENI — Project Status

**Version:** Foundation v1.15
**Current Phase:** P10.777–P10.808 synthetic application-surface implementation
**Implementation Track:** P10.808
**Branch:** `main`

## Latest Progress

- P10.577–P10.584 pilot-readiness evidence and fail-closed certification contract;
- P10.585–P10.592 API/application transport contract;
- P10.593–P10.600 responsive operator read-model contract;
- P10.601–P10.608 regu jaga reporting/export contract;
- P10.609–P10.632 controlled integration gate;
- P10.633–P10.656 controlled synthetic verification suite;
- P10.657–P10.680 QR, reporting and operator workflow hardening;
- P10.681–P10.704 synthetic E2E orchestration;
- P10.705–P10.728 UI/operator read-model contract;
- P10.729–P10.752 deterministic report-renderer preparation;
- P10.753–P10.776 regression/security hardening baseline;
- P10.777–P10.784 UI shell/read-model implementation boundary;
- P10.785–P10.792 QR scan-result adapter contract;
- P10.793–P10.800 report artifact adapter contract;
- P10.801–P10.808 composed synthetic application-surface regression tests.

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

**P10.808 — SYNTHETIC APPLICATION-SURFACE CONTRACT READY**

The repository now contains the application-surface contracts for UI/read-model access, QR verification outcomes, deterministic report artifact adaptation and composed regression coverage. These additions do not authorize live database execution or production deployment.

## Next Gate

**P10.809+ — synthetic regression execution/evidence composition and continued application-surface hardening.** Live integration remains blocked until explicit governance clearance and an approved non-production target.
