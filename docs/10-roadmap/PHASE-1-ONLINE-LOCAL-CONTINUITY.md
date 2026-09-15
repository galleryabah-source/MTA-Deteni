# MTA DETENI — Phase 1: Rp0 Online + Local Continuity

**Status:** PLANNED / FOUNDATION
**Version:** 1.0
**Date:** 2026-09-15

## Objective

Establish a zero-cost initial deployment path using GitHub + Cloudflare + Supabase while designing the application so operational continuity is preserved when internet connectivity fails.

The local deployment is not merely a backup. It is a **Local Continuity Server** capable of serving MTA DETENI to PCs, tablets, and smartphones connected to the same trusted LAN/Wi-Fi.

## Target Architecture

```text
                         INTERNET
                            |
                            v
                     +--------------+
                     |  CLOUDFLARE  |
                     | DNS / SSL /   |
                     | Edge / WAF    |
                     +------+-------+
                            |
                            v
                     +--------------+
                     | CLOUD MTA     |
                     | Pages/Worker  |
                     +------+-------+
                            |
                            v
                     +--------------+
                     |   SUPABASE   |
                     | PostgreSQL    |
                     | Auth/Storage  |
                     +------+-------+
                            ^
                            |
                     SYNC ENGINE
                            |
                 +----------+----------+
                 |   LOCAL SERVER     |
                 | Docker             |
                 | MTA Web/API        |
                 | PostgreSQL         |
                 | Sync Engine        |
                 | Backup             |
                 +----------+----------+
                            |
                         LAN/Wi-Fi
                  +---------+---------+
                  |         |         |
                 PC      TABLET   SMARTPHONE
```

## Phase 1 Stack

- GitHub: source of truth, versioning, CI/CD.
- Cloudflare: DNS, HTTPS, edge security, Pages/Workers runtime as appropriate.
- Supabase Free: PostgreSQL, Auth and Storage during initial development/staging.
- Local PC/Mini PC: Docker-based Local Continuity Server.
- PostgreSQL: common persistence model; application must not become provider-locked to Supabase.
- PWA/responsive web UI: access from PC, tablet and smartphone.

## Explicit Decision

**Vercel is not part of the MTA DETENI deployment architecture.** The cloud deployment target is Cloudflare, with Supabase as the initial managed PostgreSQL/Auth/Storage platform.

## Local Continuity Requirements

### LC-01 — LAN Operation

When internet connectivity is unavailable but the trusted LAN/Wi-Fi and Local Continuity Server are operational, users must be able to access MTA DETENI locally.

Example target:

```text
http://mta.local
```

or a controlled local IP/hostname.

### LC-02 — Cloud Independence

Local operation must not require an active internet connection for supported operational functions.

### LC-03 — Same UI

The local application must use the same responsive MTA DETENI interface and support:

- desktop/PC;
- tablet;
- smartphone.

### LC-04 — Local Database

The local deployment must use PostgreSQL and preserve the same domain/application contracts used by the cloud deployment.

### LC-05 — Synchronization

When connectivity returns, local changes must synchronize safely to the cloud.

### LC-06 — Idempotency

Every synchronizable mutation must have a stable idempotency/operation key so retries cannot create duplicate business records.

### LC-07 — Pending Queue

Local mutations must have explicit synchronization state, for example:

```text
PENDING -> SYNCING -> SYNCED
                 \-> FAILED -> RETRY
```

### LC-08 — Conflict Handling

Conflicting changes must not be silently overwritten. The sync engine must surface a deterministic conflict state and apply an explicit domain policy.

### LC-09 — Audit Preservation

Offline/local mutations must retain actor, device, timestamp, operation ID, request/correlation context where available, and audit evidence. Synchronization must not erase local audit history.

### LC-10 — Backup

The Local Continuity Server must support scheduled PostgreSQL backups and restore verification. Local backup is complementary to cloud backup, not a substitute for it.

## Emergency Offline Layer

A secondary browser-side capability may use PWA cache and IndexedDB for limited emergency workflows when both internet and Local Continuity Server are unavailable.

This is **not** the primary offline architecture.

Priority:

```text
1. Cloud mode
2. Local Continuity Server + LAN
3. Limited device emergency offline mode
```

Critical operations must not be implemented in browser-only storage unless the security, audit, conflict and recovery model is explicitly approved.

## Synchronization Model

Prefer event/change-based synchronization over blind database copying.

Minimum conceptual record:

```text
operation_id
entity_type
entity_id
operation
payload
actor_id
device_id
created_at
sync_status
retry_count
```

The cloud must acknowledge operations idempotently. A lost network response must be safe to retry.

## Deployment Profiles

### Cloud/Staging

```text
GitHub -> CI -> Cloudflare -> Supabase
```

Use synthetic/test data only during Phase 1.

### Local

```text
GitHub -> Docker Compose -> Local MTA -> Local PostgreSQL
```

### Future Production

The local PostgreSQL/runtime may later move to an authorized Rudenim server without redesigning the application domain layer.

```text
Cloudflare -> Rudenim Server -> PostgreSQL
```

## Security Requirements

- deny-by-default authorization;
- least privilege;
- authentication and authorization remain separate;
- Supabase RLS where applicable;
- secrets never committed to Git;
- no production PII in repository;
- local server must be on a trusted/controlled network;
- firewall must restrict local services to intended LAN interfaces;
- critical audit records must be protected from ordinary user modification;
- synchronization endpoints require authentication and authorization;
- rate limiting and abuse controls apply to cloud-facing sync APIs;
- device identity must be explicit where required by the sync model.

## Phase 1 Checkpoints

- [ ] P1.1 Repository baseline audit
- [ ] P1.2 Cloudflare account/configuration baseline
- [ ] P1.3 Supabase project baseline
- [ ] P1.4 Environment/secret contract
- [ ] P1.5 Cloud runtime deployment
- [ ] P1.6 Authentication baseline
- [ ] P1.7 Authorization/RLS baseline
- [ ] P1.8 Audit baseline
- [ ] P1.9 Docker Local Continuity Server
- [ ] P1.10 Local PostgreSQL
- [ ] P1.11 LAN/Wi-Fi access from PC
- [ ] P1.12 LAN/Wi-Fi access from tablet
- [ ] P1.13 LAN/Wi-Fi access from smartphone
- [ ] P1.14 Cloud/local connectivity detection
- [ ] P1.15 Sync queue
- [ ] P1.16 Idempotent synchronization
- [ ] P1.17 Conflict handling baseline
- [ ] P1.18 Local backup
- [ ] P1.19 Restore test
- [ ] P1.20 Internet outage simulation
- [ ] P1.21 Recovery and resynchronization test
- [ ] P1.22 CI security/build gate
- [ ] P1.23 End-to-end certification

## Acceptance Criteria

Phase 1 is complete only when all of the following are demonstrated:

1. MTA DETENI is reachable through Cloudflare in staging.
2. Supabase PostgreSQL is operational for staging.
3. Vercel is not required for build/deployment/runtime.
4. A local Docker deployment can start independently.
5. PCs, tablets and smartphones on the trusted LAN can access the local MTA.
6. Supported local operations continue when internet connectivity is intentionally disabled.
7. Local mutations are queued and auditable.
8. Reconnection synchronizes changes without duplicates.
9. Sync retry is idempotent.
10. Conflicts are explicit and never silently lost.
11. Local PostgreSQL can be backed up and restored successfully.
12. Synthetic data remains the only data used in repository/staging during this phase.
13. Cloud and local deployments use compatible application/domain contracts.

## Cost Target

Initial target: **Rp0** using existing PC hardware and free tiers where available.

Potential future paid components are intentionally deferred until capacity, availability, security, retention, or operational requirements justify them.

## Non-Goals

Phase 1 does not yet authorize:

- production detainee data;
- unrestricted public exposure of the local server;
- blind bidirectional database replication;
- automatic conflict overwriting;
- browser-only implementation of critical operational transactions;
- Vercel as a fallback dependency.
