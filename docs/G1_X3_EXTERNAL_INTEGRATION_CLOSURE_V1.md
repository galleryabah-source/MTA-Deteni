# G1-X3 External Integration Closure V1

## Scope

G1-X3 determines whether any external API consumer, webhook, ETL/synchronization job, callback, scheduler, or external service can create or mutate `mta_detainees`, or depends on the legacy `code` field.

This is an evidence audit only. It does not rotate credentials, revoke service-role access, remove compatibility input, or change the production database contract.

## Evidence reviewed

- Cloudflare production worker `worker-v11.js`
- Cloudflare production deployment workflow
- Supabase Edge Functions:
  - `mta-api`
  - `mta-login`
  - `mta-outbox-dispatcher`
- application integration contracts under `src/application/`
- deployment station and recovery evidence scripts
- controlled backup/restore operation artifact
- repository tree for integration/webhook/import/ETL/scheduler-related surfaces
- prior bounded production telemetry recorded by G1-X4

## Findings

### X3-A — Known inbound application transport

**FOUND / CANONICAL**

The only identified production application transport is:

```
Browser
  ↓
Cloudflare worker-v11
  ↓
Supabase mta-login / mta-api
  ↓
canonical server-side mutation boundary
```

`worker-v11.js` forwards authenticated `/api/mta/*` requests to the Supabase `mta-api` Edge Function and forwards login requests to `mta-login`.

No alternate repository-owned HTTP mutation transport was identified in the inspected runtime surface.

### X3-B — External webhook / callback receiver

**NOT ESTABLISHED**

No repository-owned webhook or callback receiver was identified in the inspected integration/runtime surfaces.

This does not prove that an undocumented external service cannot call the public API directly. External caller inventory outside the repository remains an operational evidence question.

### X3-C — ETL / bulk synchronization / detainee import

**NOT ESTABLISHED**

No dedicated CSV/XLSX detainee importer, ETL worker, scheduled synchronization implementation, or repository-owned bulk creation pipeline was established.

G1-X2 separately records the absence of a repository-owned operational detainee importer. That evidence is not treated as proof of zero undocumented external procedures.

### X3-D — Outbound integration

**FOUND / INTERNAL ONLY**

`mta-outbox-dispatcher` uses `SUPABASE_SERVICE_ROLE_KEY` to claim and complete internal outbox events. Its current publisher is `INTERNAL_APPLICATION_DISPATCH`.

No external provider delivery endpoint was established in the inspected dispatcher source.

Therefore the current repository evidence supports:

```
mutation
  ↓
audit + outbox
  ↓
internal application dispatch
```

rather than a proven external delivery integration.

### X3-E — Cloudflare / Supabase credentials

**FOUND / GOVERNED**

Repository-visible workflow source references:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

The production Cloudflare deployment workflow uses these credentials only for Cloudflare deployment/version/runtime verification.

Supabase service-role credentials are consumed by server-side Edge Functions through environment variables. Their secret values are not present in repository source.

The repository does not expose GitHub Actions environment/secret-store contents; therefore an unused undocumented privileged Supabase credential outside the inspected source cannot be ruled out from repository evidence alone.

### X3-F — Scheduler / cron / autonomous integration

**NOT ESTABLISHED**

No repository-owned external scheduler or webhook-driven detainee mutation mechanism was established.

Previously inspected production catalog evidence found no `pg_cron`, `pg_net`, `pgmq`, or `cron.job` relation.

This remains bounded evidence, not proof against external infrastructure schedulers.

### X3-G — Legacy `code` dependency

The canonical production API still permits `code` on detainee CREATE as temporary compatibility input. It rejects `code` mutation on UPDATE.

The external integration audit therefore cannot declare the legacy CREATE dependency retired merely from repository inspection.

## Production telemetry boundary

Prior G1-X4 bounded production observation recorded:

- 2026-10-02 00:00–16:00 Asia/Jakarta
- 42 matching `mta-api` edge events
- detainee REST events observed in that window were GET operations
- no POST/PATCH/DELETE detainee request was observed
- bounded PostgreSQL log search for `mta_detainees` with INSERT/UPDATE/DELETE returned 0 rows

This is positive evidence for the observed window only. It is not historical proof of zero external integration use.

## X3 decision

**G1-X3 = PARTIALLY CLOSED / EXTERNAL OPERATIONAL PROVENANCE UNVERIFIED**

Repository-owned external integration surface:
- no alternate detainee mutation API identified
- no webhook receiver identified
- no ETL/import implementation identified
- outbox delivery is internal
- Cloudflare deployment credentials are identified

Still unverified:
1. external systems that may possess a privileged credential
2. operator-owned scripts outside the repository
3. external scheduler/ETL infrastructure
4. undocumented API consumers
5. historical integrations not represented in current source

## Impact on legacy `code`

The result does **not** satisfy G1.

The temporary compatibility CREATE contract remains:

- NID: canonical, database-generated
- `code`: caller-supplied compatibility input on CREATE
- UPDATE of `code`: denied
- READ: NID-first
- DROP/rename: blocked

G2 remains blocked until G1 is fully certified.

## Required next evidence

Proceed to G1-X5 Recovery Operator Closure:

1. identify backup archive ownership;
2. identify restore operator and privileged execution path;
3. reconcile service-role access used by backup/restore;
4. establish controlled restore provenance;
5. define and rehearse the versioned backup/restore transition required before legacy `code` CREATE removal.

No production restore operation should be executed as part of this evidence-only closure without explicit governance clearance.
