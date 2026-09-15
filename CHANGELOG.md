# Changelog

## P13.6361–6400 — Reporting Governance Boundary

- Added explicit fail-closed reporting governance gate for synthetic-only development.
- Bound operational report snapshot validation and rendering to the governance gate.
- Explicitly prohibited schema migration, production persistence and AI runtime dependency within this checkpoint.
- Added rejection of production provenance in synthetic reporting fixtures.
- Added regression proving operational rendering passes through the governance boundary.
- No schema migration introduced.

## P13.6321–6360 — Operational Report Rendering Boundary

- Added deterministic operational report rendering contract over validated report snapshots.
- Added explicit section-order validation and mandatory-section enforcement.
- Bound rendered output to snapshot identity and document number.
- Added fail-closed content-drift verification.
- Added synthetic regression for deterministic rendering, incomplete/reordered sections, content tampering and missing mandatory sections.
- Preserved Migration Freeze, AI OFF, synthetic-only repository data, production authorization FALSE and live PostgreSQL block.
- No schema migration introduced.

## P13.6281–6320 — Reporting Export Envelope & Binding Contract

- Added framework-neutral export envelope derived only from an integrity-checked reporting artifact.
- Bound export identity to `artifactId`, `snapshotId` and `sourceRevision`.
- Reused the artifact canonical snapshot as deterministic export content; no alternate serialization was introduced.
- Added fail-closed verification for export binding and content tampering.
- Added synthetic regression for valid export, altered content and snapshot/artifact binding drift.
- Preserved Migration Freeze, AI OFF, synthetic-only repository data, production authorization FALSE and live PostgreSQL block.
- No schema migration introduced.

## P13.6241–6280 — Reporting Artifact Integrity & Export Contract

- Added framework-neutral reporting artifact contract derived only from an integrity-checked reconnect reporting snapshot.
- Bound artifact identity to `snapshotId` and `sourceRevision`.
- Persisted the canonical snapshot representation as the deterministic artifact content contract.
- Added fail-closed artifact verification for snapshot binding and canonical-content tampering.
- Added regression for valid artifact creation, tampered snapshot rejection and evidence/snapshot mismatch rejection.
- Preserved synthetic-only execution, Migration Freeze, AI OFF, production authorization FALSE and live PostgreSQL block.
- No schema migration introduced.
