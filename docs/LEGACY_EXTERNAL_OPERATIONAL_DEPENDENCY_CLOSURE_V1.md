# Legacy External / Operational Dependency Closure V1

Date: 2026-10-02

## Purpose
G1 establishes whether any production caller, import/manual procedure, integration, database writer, or recovery path outside the inspected repository still requires legacy detainee `code` as an authoritative creation input or operational identity.

Status vocabulary: PROVEN, OBSERVED, UNVERIFIED, BLOCKER.

## Preconditions
PR #297 is GREEN.
- Head: `1f9cb1eaec8767a3a0be8a5da3fe16a28608247b`
- Legacy Code Creation Compatibility Strategy #1: `37014309337` — SUCCESS
- MTA Feature Verification #549: `37014309011` — SUCCESS

## Evidence matrix
| ID | Surface | Status |
|---|---|---|
| G1-E01 | Repository callers / prior provenance inventory | PROVEN |
| G1-E02 | Canonical `mta-api` application boundary | PROVEN |
| G1-E03 | Production adapter uses canonical Edge endpoint | PROVEN |
| G1-E04 | Last-24h telemetry: POST/PATCH/DELETE to `/functions/v1/mta-api/detainees` | OBSERVED: 0 rows |
| G1-E05 | Last-24h mutation traffic through `mta-api` | OBSERVED: no detainee mutation |
| G1-E06 | Runtime authenticated callers | OBSERVED |
| G1-E07 | Direct DB writers outside application path | **BLOCKER** — `authenticated` and `service_role` have INSERT/UPDATE grants; RLS constrains `authenticated`, but grant existence means direct DB/API writer capability remains an open closure item |
| G1-E08 | Import/manual procedures | UNVERIFIED / BLOCKER |
| G1-E09 | External integrations / ETL / scheduled jobs | UNVERIFIED / BLOCKER |
| G1-E10 | Backup/recovery operators and archives | UNVERIFIED / BLOCKER |
| G1-E11 | Historical source of existing legacy `code` values | UNVERIFIED / BLOCKER |

## Direct database writer evidence

Production catalog inspection found direct table privileges on `public.mta_detainees`:

- `authenticated`: SELECT, INSERT, UPDATE, DELETE;
- `service_role`: SELECT, INSERT, UPDATE, DELETE;
- `postgres`: full administrative table privileges.

The `authenticated` role is constrained by four `mta_detainees_*_scope` RLS policies, including INSERT/UPDATE role and scope checks. This is an authorization control, not proof that direct database/API write capability is unused.

The deployed `mta-api` itself is currently fail-closed for operational writes unless `MTA_PRODUCTION_WRITES_ENABLED=true`, so the direct table grants are a separate database/API capability surface and remain relevant to X4.

A bounded `postgres_logs` search for INSERT/UPDATE/DELETE statements referencing `mta_detainees` returned no matching rows in the inspected 24-hour window. The available Postgres telemetry therefore gives **no observed direct mutation evidence in that window**, but it does not establish historical zero usage or identify every credential/client that could exercise the grants.

This makes X4 a concrete production closure item: identify which operational clients/credentials can use these grants and whether any such client supplies legacy `code`.

## Production telemetry
Supabase project: `tmmhxqgzelgrsrxbbfzh`. The bounded last-24-hour query against `function_edge_logs` used:

```text
pathname LIKE '/functions/v1/mta-api/detainees%'
method IN (POST, PATCH, DELETE)
```

Result: `0 rows`.

This proves only that no detainee mutation reached the canonical Edge API during the observed window. It does not exclude direct database clients, imports, manual SQL, scheduled jobs, or external integrations.

The same window showed authentication POSTs and one `mta-api/admin-config` PATCH; no detainee mutation through `mta-api` was observed.

## Repository/runtime boundary
The README states operational detainee data, credentials, and production PII remain outside Git. Therefore:

```text
Git search = evidence of repository consumers
Git search != proof of all operational consumers
```

The production adapter uses the canonical endpoint `https://tmmhxqgzelgrsrxbbfzh.supabase.co/functions/v1/mta-api`. Current CREATE compatibility still supplies `code`; UPDATE mutation of existing `code` is denied.

## Required external closure evidence
### X1 — Production caller inventory
Inventory every system able to create/mutate detainees: web runtime, direct API clients, Data API clients, scheduled jobs, scripts, operator/admin tooling, spreadsheet/import tooling, ETL/integration jobs, external services, and recovery tooling. Record owner, entry point, auth identity, transport, `code` dependency, NID dependency, and last use.

### X2 — Import/manual procedure attestation
For each operational import/manual procedure record source, operator role, procedure/version, target, whether `code` is entered/generated, whether NID is present, and whether creation works without `code`. If none exists, obtain explicit attestation.

### X3 — Integration inventory
Map every detainee identity exchange as producer -> transport -> consumer for `id`, `nid`, and `code`, distinguishing compatibility/display-only use from authoritative create/resolve dependency.

### X4 — Database access inventory
Identify production roles/users/service credentials that can INSERT or UPDATE `public.mta_detainees`, including whether `code` is required.

### X5 — Recovery inventory

The deployed `mta-api` v24 exposes `GET /backup` with `schemaVersion: 1` and serializes `mta_detainees` with `select("*")`, so legacy `code` is currently carried in the backup payload. The restore endpoint `POST /backup-restore` requires OWNER and delegates to `mta_restore_backup_transaction`.

Production catalog inspection found no function named `mta_restore_backup_transaction`. Therefore the current deployed restore path is **not provisioned at the database boundary** and must not be treated as a completed recovery capability. This is a concrete G1 recovery finding, not a reason to remove `code`.

Operational backup archives, restore operators, and any external recovery procedures remain unverified.
Identify backup producers, storage locations, restore operators, restore procedures, backup schema versions, and whether restore requires or merely preserves `code`.

## G1 decision
```text
Repository/runtime evidence       PROVEN
Production telemetry              OBSERVED
Import/manual closure              UNVERIFIED
External integration closure      UNVERIFIED
DB writer closure                 UNVERIFIED
Recovery operator closure         UNVERIFIED

G1 CERTIFICATION                   BLOCKED
```

This is an intentional BLOCKED state, not a failed implementation. Current evidence proves the canonical application path and the bounded telemetry observation, but not every external/manual/recovery caller.

## Safety rule
Until X1-X5 are closed:
- retain temporary legacy `code` CREATE compatibility;
- keep existing `code` immutable;
- do not invent a legacy generator;
- do not remove `code` from the production schema;
- do not start G2 as if G1 were certified.

## Exit condition
G1 becomes GREEN only when X1-X5 each have explicit evidence or authoritative operational attestation and no active authoritative dependency on legacy `code` remains.

## Evidence provenance
- PR #297 head: `1f9cb1eaec8767a3a0be8a5da3fe16a28608247b`
- CI: `37014309337`
- Feature Verification: `37014309011`
- Supabase project: `tmmhxqgzelgrsrxbbfzh`
- deployed `mta-api` version observed in telemetry: `24`
- telemetry source: Supabase `function_edge_logs`
- governance boundary: `README.md`

## Final statement
G1 is not certified. Physical legacy `code` retirement remains blocked. No production mutation was performed by this audit.

## G1-X4 deepening — database/API writer surface

Additional production catalog evidence was collected on 2026-10-02:

- `public.mta_detainees` grants INSERT and UPDATE to `authenticated` and `service_role`.
- `authenticated` cannot bypass RLS; `service_role` can bypass RLS.
- The four detainee RLS policies enforce role/scope checks for SELECT, INSERT, UPDATE and DELETE.
- `postgres` is a login-capable administrative role and has table mutation privileges.
- No separate public database function was found that generates or owns legacy detainee `code`; the inspected public routine inventory returned `mta_resolve_qr` as the only detainee-named routine.

This narrows X4 but does not close it. The grants prove capability, while the bounded telemetry only proves no observed direct mutation in the inspected window. Credential-to-client provenance and historical usage remain unverified.

## G1-X1/X3 runtime surface review

The production project currently exposes three ACTIVE Edge Functions: `mta-api` v24, `mta-outbox-dispatcher` v2, and `mta-login` v1.

- `mta-api` is the canonical operational API. Its deployed source routes detainee writes through the server-side idempotent mutation boundary and uses the service-role client for the mutation transaction.
- `mta-outbox-dispatcher` consumes outbox events and calls `claim_outbox_events`, `complete_outbox_event`, and `release_outbox_event`; its deployed source does not directly read or mutate `mta_detainees`.
- `mta-login` is authentication-only and does not access `mta_detainees`.

This is runtime evidence for the known application surfaces, not an attestation that no external caller, scheduled job, operator script, ETL, or direct Data API client exists.

## X2/X5 unresolved operational evidence

No authoritative repository/runtime evidence currently establishes the existence or non-existence of an operational import/manual procedure, external ETL/integration, backup archive owner, restore operator, or historical source system for existing `code` values. These remain explicit UNVERIFIED blockers.

The deployed backup contract remains schemaVersion 1 and carries `code` through the detainee snapshot. The deployed restore route references `mta_restore_backup_transaction`, but the production catalog does not contain that function. No restore rehearsal was performed.

## Current G1 state after deepening

```text
X1 Production caller inventory       PARTIAL / UNVERIFIED external callers
X2 Import/manual attestation         UNVERIFIED
X3 Integration inventory             PARTIAL / UNVERIFIED external integrations
X4 DB writer provenance              BLOCKED
X5 Recovery operator/archive         UNVERIFIED / BLOCKED

G1 CERTIFICATION                    BLOCKED
```

The evidence package remains audit-only: no production mutation, grant change, schema change, or restore operation was performed.

## G1-X4 containment implementation

PR #299 (hardening: contain direct detainee DML at database boundary) passed its dedicated containment gate and Feature Verification:
- G1 Detainee Direct Write Containment #1: `37023759289` — SUCCESS
- MTA Feature Verification #555: `37023758739` — SUCCESS
- merged into the G1 branch at `a86529ef2e41228ac31f3cd83bdd3c8a8ee385ad`.

The repository migration is intentionally **not yet applied to production**. It revokes INSERT/UPDATE/DELETE from `authenticated` while preserving authenticated SELECT/RLS and the canonical `service_role` mutation path. This is a containment candidate that reduces the direct writer surface; it does not by itself close X4 because service credentials and any external operational clients still require provenance closure.

Production ACL remains unchanged until the governed production rollout gate is satisfied.

Recent production audit evidence also strengthens the canonical-path finding: 18 detainee audit mutations in the last 30 days were all tagged `P9.7-DURABLE-v1`, with no alternate transaction boundary observed in that audit sample. This is strong positive evidence for canonical usage, but not proof of historical zero direct-DML usage.
