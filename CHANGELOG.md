# Changelog

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

## P13.6201–6240 — Reporting Integrity & End-to-End Continuity Certification

- Hardened reporting snapshot immutability by freezing projected rows as well as the row collection.
- Added canonical reporting snapshot verification for deterministic export/rendering inputs.
- Added reconnect reporting integrity guard binding snapshot `sourceRevision`, evidence identity, decision, queue states, payload hash, idempotency key and recording timestamp.
- Added complete synthetic journey regression: offline command → reconnect transition → synced state → reconnect evidence → reporting projection → canonical snapshot verification.
- Added negative-path tamper coverage for source revision and evidence material, plus row-level immutability.
- Preserved Migration Freeze, AI OFF, synthetic-only repository data, production authorization FALSE and live PostgreSQL block.
- No schema migration introduced.
