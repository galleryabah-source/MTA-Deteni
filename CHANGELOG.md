# Changelog

## P13.7401–7440 — Reconciliation & Application Service Seams

- Added deterministic reconciliation across repository entity state, offline queue state and reporting projection source revision.
- Added explicit reconciliation outcomes: `CONSISTENT`, `REPLAY_REQUIRED`, `CONFLICT`, and `MISSING_PROJECTION`, with fail-closed safety for unresolved states.
- Added a unified application mutation service seam for detainee registration, placement, movement and temporary-exit advancement.
- Application service authorization is evaluated before entering the critical mutation kernel.
- All mutation paths route through the existing transaction, idempotency, audit and outbox integration boundary; no direct persistence implementation was added.
- Added synthetic regression coverage for deterministic reconciliation, replay behavior, source conflicts, and prevention of duplicate audit/outbox effects.
- No concrete database driver, schema migration, AI activation, production persistence, or live PostgreSQL execution.

## P13.7121–7200 — Critical Mutation Integration Seam

- Added an application integration seam composing idempotency, transaction execution, domain mutation, mandatory audit and transactional outbox publication within the transaction runner boundary.
- Added fail-closed replay behavior for completed idempotency keys and explicit conflict behavior for request-hash reuse.
- Added synthetic regression coverage for commit, replay and conflict paths.
- No concrete database driver or production persistence was introduced.

## P13.6961–7040 — Report Output Envelope & Export Certification

- Added a certified report output envelope with format, MIME type, filename, snapshot identity, document identity and content fingerprint binding.
- Added deterministic PDF/DOCX filename and MIME policy behind the existing renderer certification boundary.
- Added end-to-end daily guard export certification from snapshot → renderer → certification → output envelope.
- Added fail-closed output tampering regression coverage and incomplete-report rejection.
- Binary PDF/DOCX generation remains behind an explicit runtime/dependency approval gate.
- No schema migration, AI activation, production persistence, or live PostgreSQL execution.

## P13.6881–6960 — Renderer Certification & Template Versioning

- Added a deterministic renderer certification contract with explicit `DGRT-1.0` template version.
- Added stable output identity binding to template version, format, snapshot identity and document number.
- Added deterministic content fingerprinting for regression evidence; this is not presented as a cryptographic security primitive.
- Added fail-closed certification checks for format mismatch, snapshot/document drift, content tampering and non-synthetic output.
- Added negative regression coverage across cross-format binding, snapshot drift and content tampering.
- No binary document generation dependency was introduced; PDF/DOCX remain adapter-boundary formats only.
- No schema migration, AI activation, production persistence, or live PostgreSQL execution.

## P13.6801–6880 — Daily Guard Source Presentation Mapping

- Inspected the supplied operational daily guard report and recorded only presentation facts evidenced by the source: report title, organization lines, Rudenim Pontianak location, Bravo morning duty label, 11 September 2026 date, 07.00–14.00 WIB duty interval, closing location/date, and signature labels.
- Added an explicit presentation contract separate from the business/domain `ReportSnapshot` model.
- Recorded only evidenced section headings; unsupported layout labels remain intentionally unmapped rather than invented.
- Added deterministic mapping validation for snapshot sections without changing business data.
- Added synthetic PDF and DOCX renderer adapter boundaries behind the existing renderer abstraction. These are format contracts only; they do not emit production documents or perform persistence.
- Added regression coverage for source facts, domain/presentation separation, deterministic PDF/DOCX adapter output, and synthetic-only enforcement.
- No schema migration, AI activation, production persistence, or live PostgreSQL execution.

## P13.6481–6520 — Integrated Daily Guard Report Journey

- Added an application-level journey composing operational report preview and validated download as one deterministic flow.
- Bound the journey to the report snapshot and preserved preview/download identity.
- Added synthetic regression for successful daily guard report completion and incomplete-report fail-closed behavior.
- Preserved reporting governance, snapshot integrity and rendering boundaries; no bypass path introduced.
- No schema migration introduced.
