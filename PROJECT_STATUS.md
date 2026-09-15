# MTA DETENI — Project Status

**Version:** Foundation v1.34
**Current Phase:** P12.681–P12.840 operational evidence and cross-domain integrity
**Implementation Track:** P12.840
**Branch:** `main`

## Latest Progress

- P12.681–P12.720 operational evidence ledger contract;
- P12.721–P12.760 projection failure/recovery matrix;
- P12.761–P12.800 API audit envelope contract;
- P12.801–P12.840 cross-domain consistency contract and regression coverage.

## Integrated Application Model

RAP owns registration, administration and reporting; PERKES owns health records and health workflows; KAMTIB owns placement, movement, headcount, temporary exit, escort and operational QR; SUBBAG TU owns escort document administration; HEAD RUDENIM has oversight, read-only operational visibility and authority for petunjuk, arahan, rekomendasi and disposisi without direct operational editing.

## Operational Application Chain

`UI/API Command → Authorization Policy → Transaction Context → Idempotency → Domain Workflow → Immutable Timeline/Audit → Operational Evidence → Outbox → Projection Checkpoint → Read Model → QR/Movement/Temporary Exit → Reporting`

Operational evidence now has an explicit append-only contract. Projection failures have deterministic recovery actions. Accepted API commands require audit evidence, while rejected/failed commands require explicit error classification. Cross-domain records are blocked when detainee, aggregate or correlation identity drifts.

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

Leadership is explicitly limited to oversight-read and directive permissions and is denied direct operational mutation permissions.

Operational evidence is authoritative only when produced through the governed operational chain. Read models and projection checkpoints remain derived state.

Projection identity drift is a HALT condition; checkpoint drift requires rebuild from committed evidence. This prevents silent corruption from being promoted to the operator surface.

## Current Gate

**P12.840 — OPERATIONAL EVIDENCE/CROSS-DOMAIN CONTRACT-READY / EXECUTION-CERTIFICATION PENDING**

Regression coverage was added for evidence identity, recovery decisions, accepted-command audit binding and cross-domain identity consistency. GitHub execution telemetry remains unavailable, so these controls are not certified as executed.

## Execution Certification Rule

CI or local execution may be certified only from observable command/job telemetry. `NOT_RUN`, missing evidence, non-zero exit codes, target mismatch, identity drift, or missing output identity remain blocked. No CI PASS, database PASS, production readiness, or operational authorisation is claimed.

## Next Gate

**P12.841–P12.960 — canonical operational aggregate envelope, QR/temporary-exit evidence binding, reporting snapshot integrity, and end-to-end synthetic governance gate.**

No production or live-database step is implied by this next gate.
