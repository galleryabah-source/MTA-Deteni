# MTA DETENI — Project Status

**Version:** Foundation v1.56
**Current Phase:** P13.4441–P13.4560 observed-execution certification boundary
**Implementation Track:** P13.4560
**Branch:** `phase-p12.961-13.200`

## Latest Progress

- P13.4441–P13.4480 — observed execution manifest contract;
- P13.4481–P13.4520 — controlled non-production certification contract;
- P13.4521–P13.4560 — deployment readiness barrier;
- regression tests added for the evidence and deployment barriers;
- certification documentation added.

## Current Gate

**P13.4560 — OBSERVED-EXECUTION CONTRACT-READY / ACTUAL EXECUTION EVIDENCE PENDING**

The application now distinguishes contractual readiness from observed execution. Execution observations require execution identity, control identity, timestamps, successful exit code and output identity. Controlled non-production certification requires each control to be observed and passed. Deployment readiness additionally requires explicit source/test/security/backup-restore/migration-plan review and production authorization.

The active branch remains configured for push-triggered domain CI, but the available GitHub Actions query has not returned an observable workflow run for the new commits. Therefore CI/execution remains **NOT CERTIFIED**. No PASS is inferred from source presence.

## Integrated Application Model

RAP owns registration, administration and reporting; PERKES owns health records and health workflows; KAMTIB owns placement, movement, headcount, temporary exit, escort and operational QR; SUBBAG TU owns escort document administration; HEAD RUDENIM has oversight, read-only operational visibility and authority for petunjuk, arahan, rekomendasi and disposisi without direct operational editing.

## Safety / Governance

- Migration Freeze: **TRUE**;
- AI: **OFF**;
- Repository data: **SYNTHETIC ONLY**;
- Production access: **NOT AUTHORIZED**;
- Live PostgreSQL execution: **BLOCKED until explicit governance clearance and an approved non-production target**;
- No schema migration introduced;
- No real detainee data, credentials, health records, WhatsApp exports or production PII in GitHub;
- No autonomous AI decision-making;
- No direct WhatsApp/OCR/transcript → approved operational record.

## Design Integrity

- Temporary-exit remains distinct from deportation.
- QR remains contextual operational verification and is not a free-form data-entry path.
- Leadership remains oversight/directive only and cannot directly mutate operational data.
- Offline operation never creates authority.
- Sync conflicts require human review.
- Report artifacts require deterministic inputs and reconciled source bindings.
- Exact visual report reproduction remains gated by the approved source template and observable rendering evidence.
- Certification evidence requires execution identity, output identity and telemetry identity; `NOT_RUN` never becomes PASS.
- Production deployment is now explicitly impossible through the readiness contract without authorization.

## Next Gate

**P13.4561–P13.4680 — test/evidence aggregation, report-rendering evidence adapter, local-server/LAN acceptance evidence, and final release-candidate evidence index.**

This gate remains evidence-driven and non-production. No production or live-database step is implied.
