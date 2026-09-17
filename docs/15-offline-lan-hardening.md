# MTA DETENI — P13 Offline/LAN Hardening

Status: contract implemented on `main`

## Scope

This increment establishes the contract boundary for a local/LAN runtime without opening production access, database migration, or real operational data.

## Local runtime

- `LAN_HTTP` is the transport boundary for devices on the trusted local network.
- `BROWSER_LOCAL` remains the synthetic browser fallback.
- Local PostgreSQL is represented as `LOCAL_POSTGRESQL` but remains explicitly `NONPRODUCTION_LOCAL_ONLY`.
- Authentication is required and authorization is deny-by-default.
- Material actions require audit evidence.

## Offline mutation queue

Every mutation carries:

- mutation identity;
- idempotency key;
- aggregate identity;
- operation;
- base version;
- payload fingerprint;
- lifecycle status.

The queue rejects an idempotency-key collision when the payload fingerprint differs. An identical replay is classified as `REPLAYED` and produces no second effect.

## Conflict resolution

A base-version mismatch is classified as `CONFLICT` with `BASE_VERSION_CONFLICT`. Conflicts are review-required; the adapter does not silently overwrite the current aggregate.

## Database boundary

No PostgreSQL connection or migration is introduced by this increment. The future local PostgreSQL adapter must be implemented behind this contract and tested against a dedicated non-production instance before any controlled data is admitted.

## Next hardening

1. Durable queue storage with crash-safe state transitions.
2. Deterministic sync protocol between LAN runtime and controlled central adapter.
3. Server-side idempotency ledger with unique constraint.
4. Explicit conflict-resolution workflow and audit evidence.
5. LAN health/discovery endpoint without exposing sensitive data.
6. Fully vendored offline QR dependency.
7. Browser/device matrix execution in CI.
