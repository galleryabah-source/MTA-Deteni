# G1-X4 External / Operational Privileged Credential Closure V1

Date: 2026-10-02

## Objective

Establish the strongest repository and production evidence currently available for privileged credential provenance outside the canonical mta-api writer.

Scope:
- GitHub Actions / CI/CD credential references;
- Cloudflare deployment/runtime credential boundary;
- deployed Supabase Edge Functions;
- direct browser/client credential surface;
- scheduler/database automation;
- backup/restore operator surface;
- production telemetry for direct detainee DML.

This audit does not expose, rotate, revoke, or retrieve secret values.

## 1. GitHub Actions / CI-CD

Repository workflow inventory was inspected.

Observed privileged CI/CD credential references:
- CLOUDFLARE_API_TOKEN
- CLOUDFLARE_ACCOUNT_ID

The audited workflow set did not contain a repository-visible reference to:
- SUPABASE_SERVICE_ROLE_KEY
- SUPABASE_SERVICE_ROLE
- a Supabase service-role secret used by CI/CD.

Important limitation:
GitHub secret values and the repository secret store are not exposed through the available GitHub connector. Therefore the audit can prove the workflow source does not reference the Supabase service-role secret, but cannot prove that no unused Supabase secret exists in GitHub repository/environment secret storage.

## 2. Cloudflare runtime credential boundary

The production Cloudflare Worker uses:
- Supabase Edge Function endpoint mta-login;
- Supabase Edge Function endpoint mta-api.

The browser-facing production API module contains only the Supabase project URL and a publishable key and sends application requests to /api/mta.

No service-role credential was found in the inspected client/runtime source.

The production deployment workflow uses Cloudflare credentials only. It does not deploy Supabase functions or execute Supabase migrations.

## 3. Deployed privileged Supabase runtime

Active production Edge Functions:
- mta-api v24 — service_role; canonical writer.
- mta-outbox-dispatcher v2 — service_role; no direct detainee writer identified.
- mta-login v1 — service_role; auth/profile operations, no detainee mutation identified.

Canonical detainee mutation:
mta-api -> mta_execute_idempotent_mutation -> mta_internal.execute_idempotent_mutation

Movement:
mta-api -> mta_execute_movement_transaction

The generic mutation function is service-role-only and internally requires the service-role execution context.

The direct authenticated/anon execution seam for the SECURITY DEFINER movement writer was removed by PR #300 and applied to production.

## 4. Direct client surface

Production browser code uses the publishable Supabase key and authenticated bearer access tokens.

The inspected production API adapter sends application requests through the Cloudflare /api/mta boundary.

No browser-side service-role credential was identified.

## 5. Scheduler / automation

Production catalog inspection found:
- no pg_cron extension;
- no pg_net extension;
- no pgmq extension;
- no cron.job relation.

Therefore no database-level scheduler capable of being identified through those facilities was found.

This does not prove absence of infrastructure-level schedulers outside PostgreSQL.

## 6. Backup / restore operator surface

Repository contains:
supabase/operations/mta_backup_restore_transaction_v1.sql

It is explicitly a controlled operation artifact and is not an automatic migration.

The artifact grants execution only to service_role and is intended to be called by the server-side backup/restore boundary.

Production does not currently contain the restore function.

Therefore recovery remains a separate G1-X5 closure item.

## 7. Production telemetry

Bounded production Edge log window:
2026-10-02 00:00 through 16:00 Asia/Jakarta.

Relevant Edge log search found 42 matching events across the selected detainee/mutation terms.

The returned mta_detainees REST events were GET requests. No POST/PATCH/DELETE detainee request was observed in this bounded log sample.

Bounded PostgreSQL log search for mta_detainees combined with INSERT/UPDATE/DELETE returned:
0 rows.

This is positive evidence for the observed window, not historical proof of zero bypass.

## 8. Provenance status

### CLOSED / PROVEN
- authenticated direct table DML removed;
- authenticated/anon direct movement SECURITY DEFINER execution removed;
- canonical mta-api privileged writer identified;
- active Edge Function privileged surface identified;
- browser service-role credential exposure not found;
- no PostgreSQL scheduler extension identified;
- no direct DML observed in the bounded PostgreSQL log window.

### OPEN / UNVERIFIED
1. GitHub repository/environment secret store may contain unused or undocumented privileged secrets; connector cannot inspect secret values or secret inventory.
2. External infrastructure schedulers outside PostgreSQL are not proven absent.
3. Operator/local scripts outside the repository are not proven absent.
4. External integrations outside the repository are not proven absent.
5. Administrative postgres/supabase_admin credential provenance remains open.
6. Backup/restore operator provenance remains open.

## G1-X4 conclusion

PARTIALLY CLOSED — RUNTIME PATH CLOSED, EXTERNAL/ADMINISTRATIVE PROVENANCE NOT CLOSED.

The evidence is sufficient to state that the known application runtime has been narrowed to the canonical privileged writer and that no direct detainee DML was observed in the bounded production telemetry window.

It is not sufficient to certify zero external privileged credential holders.

No privilege is revoked or rotated by this audit.

## Next gates

G1-X2 — Import / Manual Procedure Closure
    ->
G1-X3 — External Integration Closure
    ->
G1-X5 — Recovery Operator Closure
    ->
G1 final certification

G2 Legacy Code replacement remains blocked until G1 is certified.

## Evidence refresh

This document was refreshed after correcting the PR base to the canonical G1 branch so inherited CI evaluates the same provenance chain.
