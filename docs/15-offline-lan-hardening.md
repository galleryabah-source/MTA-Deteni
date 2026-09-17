# MTA DETENI — P13 Offline/LAN Hardening

Status: contract hardening implemented on `main`

## Scope

This increment strengthens the local/LAN runtime boundary without opening production access, database migration, or real operational data.

## Local runtime

- `LAN_HTTP` is the transport boundary for devices on the trusted local network.
- `BROWSER_LOCAL` remains the synthetic browser fallback.
- Local PostgreSQL is represented as `LOCAL_POSTGRESQL` but remains explicitly `NONPRODUCTION_LOCAL_ONLY`.
- Authentication is required and authorization is deny-by-default.
- Material actions require audit evidence.

## Offline mutation queue

Every mutation carries mutation identity, idempotency key, aggregate identity, operation, base version, payload fingerprint, lifecycle status, and synthetic-only marking.

The queue now also keeps an execution receipt. A successful application records the resulting aggregate version and acknowledgement timestamp instead of discarding that information. A conflict can be explicitly acknowledged without applying an effect.

## Idempotency

- Same idempotency key + same payload fingerprint = `REPLAYED`, no second effect.
- Same idempotency key + different payload fingerprint = `CONFLICT`, never silently overwrite.
- Resulting-version receipts are retained in the runtime queue boundary.

## Deterministic sync

The sync contract introduces a stable `syncId`, `deviceId`, cursor, positive sequence start, ordered mutation batch, per-item result, accepted-through sequence, and next cursor. The current implementation deliberately preserves supplied mutation order; it does not silently reorder mutations.

## Conflict resolution

A base-version mismatch is classified as `CONFLICT` with `BASE_VERSION_CONFLICT`. Resolution is an explicit reviewed action: `ACCEPT_LOCAL`, `ACCEPT_REMOTE`, `MERGE`, or `REJECT`. Every resolution requires reviewer identity, rationale, resolved version, timestamp, and audit event identity. No silent overwrite is permitted.

## Database boundary

No PostgreSQL connection or migration is introduced by this increment. The future local PostgreSQL adapter must remain behind the existing LAN adapter contract and be tested against a dedicated non-production instance before any controlled data is admitted.

## Governance locks retained

- Migration Freeze: TRUE.
- AI: OFF.
- Repository data: SYNTHETIC ONLY.
- Production access: NOT AUTHORIZED.
- Live PostgreSQL execution: BLOCKED until explicit governance clearance and an approved non-production target.

## Next hardening

1. Durable browser/LAN queue persistence with crash-safe state transitions.
2. Sync engine with deterministic acknowledgement and cursor advancement.
3. Server-side idempotency ledger design behind a future non-production database gate.
4. Conflict review state machine with immutable decision/audit evidence.
5. LAN health/discovery endpoint without sensitive data exposure.
6. Fully vendored offline QR dependency; remove runtime CDN dependency.
7. Browser/device matrix execution in CI.
