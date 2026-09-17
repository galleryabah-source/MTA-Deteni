# MTA DETENI — P13 Offline/LAN Hardening

Status: **implemented contract + browser runtime hardening; production database remains blocked**

## Completed in this increment

### 1. Durable Offline Queue

Browser mutations are persisted through IndexedDB using transactional object-store writes. The queue is synthetic-only and keyed by `idempotencyKey`. Crash recovery is based on the durable browser transaction boundary rather than in-memory state alone.

### 2. Deterministic Sync Engine

The sync boundary carries `syncId`, `deviceId`, cursor, sequence start, ordered mutations, per-item disposition, accepted-through sequence, and next cursor. Supplied mutation order is preserved; a conflict stops further admission in that batch.

### 3. Idempotency Ledger Contract

The future server-side ledger contract defines the minimum identity needed for a unique idempotency record: key, mutation identity, payload fingerprint, aggregate identity, lifecycle status, resulting version, receipt, and timestamp. Same key + same fingerprint is replay-only; same key + different fingerprint is a conflict.

No executable PostgreSQL migration has been introduced because Migration Freeze remains active.

### 4. Conflict State Machine

Conflict lifecycle is explicit:

`OPEN → UNDER_REVIEW → RESOLVED | REJECTED`

Final disposition requires reviewer identity, rationale, resolved version, timestamp, and audit event evidence. Silent overwrite is not permitted.

### 5. LAN Health / Discovery Contract

The health contract identifies a LAN runtime while exposing no operational data. The boundary remains `LOCAL_NETWORK_ONLY`, authentication is required, authorization is deny-by-default, and local PostgreSQL is explicitly non-production.

### 6. Offline Shell + Queue

Service Worker cache was advanced to v2 and now pre-caches the durable queue runtime. The browser exposes `INDEXED_DB` queue capability through `window.MTADeteniOfflineQueue`.

### 7. QR Offline Runtime

The Service Worker continues to pre-cache the QR generator dependency during online bootstrap, allowing QR generation after connectivity loss once the offline shell has completed its initial bootstrap. **A truly dependency-free first-load QR implementation is still a separate vendoring gate**; the current implementation does not falsely claim that a fresh device with no prior online bootstrap can generate QR while completely disconnected.

### 8. Browser / Device Regression

A GitHub Actions browser matrix has been added for phone (390×844), tablet (768×1024), and desktop (1440×900). The smoke gate checks horizontal overflow, offline runtime presence, durable queue presence, and page errors.

## Governance locks

- Migration Freeze: TRUE
- AI: OFF
- Repository data: SYNTHETIC ONLY
- Production access: NOT AUTHORIZED
- Live PostgreSQL execution: BLOCKED
- Real detainee data / credentials / health records / WhatsApp exports / production PII: PROHIBITED

## Next gate

1. Vendor QR generator into repository and remove all runtime CDN dependency.
2. Add durable queue state transitions and retry/backoff contract.
3. Bind sync engine to a future controlled LAN HTTP adapter.
4. Define server-side idempotency ledger SQL as a future non-executable design artifact only.
5. Add end-to-end offline/online recovery scenario tests.
