# Changelog

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
