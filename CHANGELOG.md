# Changelog

## P13.5961–6040 — Runtime Implementation Boundary

- Added framework-neutral browser transport request contract.
- Required request identity and idempotency keys for browser mutations.
- Required authenticated LAN device identity at the transport boundary.
- Added persistent queue adapter interface without coupling to a browser storage implementation.
- Added versioned synthetic backup manifest contract for recovery identity.
- Added deterministic tests for transport idempotency and backup manifest validation.
- Preserved Migration Freeze, AI OFF, synthetic-only repository data, production authorization FALSE and live PostgreSQL block.
- No schema migration introduced.

## P13.5921–5960 — Browser/RBAC/LAN Runtime Contract Expansion

- Added responsive application-surface invariants, role-aware navigation, LAN device identity, local-PC service boundary, backup/restore identity and continuity evidence binding.
- Integrated the runtime surface into the existing application surface.
