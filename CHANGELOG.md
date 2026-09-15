# Changelog

## P13.5967–6040 — Integrated Synthetic Continuity Journey

- Composed the offline command, persistent queue, browser mutation identity/idempotency, LAN session, local-PC fail-closed boundary, backup chain, reconnect reconciliation, reporting snapshot and continuity evidence into one deterministic application-level synthetic journey.
- Added regression coverage for successful end-to-end composition and expired LAN session fail-closed behavior.
- Kept the seam framework-neutral with no network, database, filesystem or production-data access.
- Preserved Migration Freeze, AI OFF, synthetic-only repository data, production authorization FALSE and live PostgreSQL block.
- No schema migration introduced.

## P13.5963–6040 — Adapter-Level Synthetic Runtime Journey

- Added persistent queue adapter seam with deterministic in-memory synthetic implementation.
- Added LAN session binding to device, installation and network scope, including expiry enforcement.
- Hardened browser transport mutations with mandatory idempotency identity.
- Added local-PC adapter boundary requiring authenticated device identity and forbidding internet exposure.
- Added versioned, synthetic-only backup manifest chain with exact predecessor binding.
- Added deterministic synthetic tests covering queue persistence, duplicate reconciliation, LAN session substitution, transport mutation safety, local boundary safety and backup-chain integrity.

## P13.5961–6040 — Runtime Implementation Boundary

- Added framework-neutral browser transport request contract.
- Required request identity and idempotency keys for browser mutations.
- Required authenticated LAN device identity at the transport boundary.
- Added persistent queue adapter interface without coupling to a browser storage implementation.
- Added versioned synthetic backup manifest contract for recovery identity.
- Added deterministic tests for transport idempotency and backup manifest validation.

## P13.5921–5960 — Browser/RBAC/LAN Runtime Contract Expansion

- Added responsive application-surface invariants, role-aware navigation, LAN device identity, local-PC service boundary, backup/restore identity and continuity evidence binding.
- Integrated the runtime surface into the existing application surface.
