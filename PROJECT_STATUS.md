# MTA DETENI — Project Status

**Version:** Foundation v1.30
**Current Phase:** P12.121–P12.280 integrity composition and authorization enforcement
**Implementation Track:** P12.280
**Branch:** `main`

## Latest Progress

- P11.161–P11.224 temporary-exit lifecycle consistency;
- P11.225–P11.288 placement/movement/headcount and operational QR consistency;
- P11.289–P11.352 synthetic cross-domain E2E and failure-path regression;
- P11.353–P11.448 placement/movement/headcount reconciliation contract;
- P11.449–P11.544 operational QR validity-window and explicit context compatibility contract;
- P11.545–P11.608 cross-domain detainee/placement/headcount aggregate composition;
- P11.609–P11.680 reporting snapshot consistency;
- P11.681–P11.816 integrated synthetic failure-path matrix;
- P11.817–P11.872 immutable operational timeline composition;
- P11.873–P11.904 audit/outbox correlation binding;
- P11.905–P11.936 idempotency-aware mutation identity;
- P11.937–P11.960 synthetic authorization regression;
- P11.961–P11.1024 transactional mutation orchestration;
- P11.1025–P11.1088 operator command/read surface;
- P11.1089–P11.1160 temporary-exit command adapter to canonical workflow;
- P11.1161–P12.120 command-to-read-model application composition;
- P12.121–P12.160 shared transaction identity/context contract;
- P12.161–P12.200 persistent idempotency contract;
- P12.201–P12.240 explicit domain authorization policy matrix;
- P12.241–P12.280 policy-enforcing authorization boundary.

## Integrated Application Model

RAP owns registration, administration and reporting; PERKES owns health records and health workflows; KAMTIB owns placement, movement, headcount, temporary exit, escort and operational QR; SUBBAG TU owns escort assignment/document administration; HEAD RUDENIM has oversight, read-only operational visibility and authority for petunjuk, arahan, rekomendasi and disposisi without direct operational editing.

## Operational Application Chain

`UI/API Command → Authorization Policy → Transaction Context → Idempotency → Domain Workflow → Immutable Timeline/Audit → Outbox → Read Model → QR/Movement/Temporary Exit → Reporting`

The application boundary now has explicit domain permission enforcement before mutation. A shared transaction context binds transaction, actor, correlation and aggregate identity. Persistent idempotency binds key, fingerprint, actor, correlation and aggregate identity. Read-model projection remains downstream of committed operational evidence and is not a hidden extension of the mutation transaction.

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

Concrete persistence adapters must preserve the shared transaction identity across domain mutation, audit, outbox and idempotency completion.

## Current Gate

**P12.280 — AUTHORIZATION ENFORCEMENT CONTRACT-READY / EXECUTION TELEMETRY STILL REQUIRED**

Static regression coverage was added for transaction identity, persistent idempotency replay safety, domain authorization ownership, policy enforcement and leadership operational-edit prevention. These controls are not execution-certified until observable CI or authorized local telemetry is available.

## Execution Certification Rule

CI or local execution may be certified only from observable command/job telemetry. `NOT_RUN`, missing evidence, non-zero exit codes, target mismatch, identity drift, or missing output identity remain blocked. No CI PASS, database PASS, production readiness, or operational authorisation is claimed.

## Next Gate

**P12.281–P12.360 — concrete non-production persistence adapters, atomic audit/outbox/idempotency implementation contract, outbox-driven read-model projection, and controlled API boundary tests.**

No production or live-database step is implied by this next gate.
