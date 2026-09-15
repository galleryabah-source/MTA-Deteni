# MTA DETENI — Project Status

**Version:** Foundation v1.12
**Current Phase:** P10.609–P10.632 controlled non-production integration gate
**Implementation Track:** P10.632
**Branch:** `main`

## Latest Progress

- P10.577–P10.584 pilot-readiness evidence and fail-closed certification contract;
- P10.585–P10.592 API/application transport contract with authorization, correlation, idempotency and audit requirements;
- P10.593–P10.600 responsive operator read-model contract with deny-by-default role access;
- P10.601–P10.608 regu jaga reporting/export contract with provenance, required sections, document numbering and approval binding;
- P10.609–P10.616 controlled target + schema/RLS reconciliation gate contract;
- P10.617–P10.624 guarded persistence execution contract;
- P10.625–P10.632 API/runtime verification contract and synthetic E2E gate.

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

**P10.632 — CONTRACT READY; CONTROLLED EXECUTION BLOCKED UNTIL TARGET AUTHORIZATION**

The repository now defines the complete controlled sequence from target authorization and read-only schema/RLS reconciliation through guarded persistence and API/runtime synthetic E2E verification. The gate can only become READY when every required evidence item passes. No live integration has been executed.

## Next Gate

**P10.633+ — implementation of controlled verification harnesses and evidence capture, still synthetic/read-only until governance clearance.**
