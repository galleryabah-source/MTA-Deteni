# Changelog

## P13.5921–5960 — Browser/RBAC/LAN Runtime Contract Expansion

- Added deterministic responsive application-surface invariants for desktop, tablet and smartphone.
- Added deny-by-default role-aware navigation using canonical application roles.
- Added multi-device LAN identity binding for device, installation and network scope.
- Added local-PC service boundary that fails closed against internet exposure and requires authenticated device identity.
- Added synthetic backup/restore identity contract with exact backup-reference binding.
- Added continuity evidence binding for control ID, execution ID, commit SHA, environment, timestamp and result.
- Integrated navigation and responsive contracts into the existing application surface rather than creating a parallel UI surface.
- Added deterministic synthetic tests for all new boundaries.
- Preserved Migration Freeze, AI OFF, synthetic-only repository data, production authorization FALSE and live PostgreSQL block.
- No schema migration introduced.

## P13.5881–5920 — Runtime/LAN/Offline Continuity

- Added deterministic runtime capability contract for CLOUD, LAN and LOCAL modes.
- Added offline command identity, idempotency-aware reconnect reconciliation and conflict-review semantics.
- Preserved fail-closed behavior for contradictory runtime capabilities.

## P13.5827–5840 — Domain-Surface Hardening

- Aligned the synthetic temporary-exit approval actor with canonical `HEAD_RUDENIM` vocabulary.
- Added deterministic movement, placement, authorization and separation-of-duties boundary tests.
- Preserved governance locks and schema migration freeze.
