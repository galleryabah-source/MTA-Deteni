# G1-X4 Administrative Writer Provenance Audit V1

Date: 2026-10-02

## Objective

Determine whether privileged PostgreSQL roles or database-scheduled facilities provide an unproven writer path to mta_detainees.

## Production role evidence

Observed production role state:

| Principal | Login | Superuser | Bypass RLS | Relevant membership |
|---|---:|---:|---:|---|
| authenticated | NO | NO | NO | none |
| anon | NO | NO | NO | none |
| service_role | NO | NO | YES | none |
| postgres | YES | NO | YES | includes service_role and administrative memberships |
| supabase_admin | YES | YES | YES | none |

Important consequence:

- postgres is login-capable and can exercise service_role membership;
- postgres retains administrative DML capability on mta_detainees;
- supabase_admin is a superuser and therefore remains outside ordinary table/RLS provenance controls.

These observations establish capability, not evidence that either administrative principal has actually mutated detainees.

## Database routine writer inventory

Production routines whose source references mta_detainees are currently:

1. mta_internal.execute_idempotent_mutation
   - owner: postgres
   - SECURITY DEFINER: NO
   - canonical generic mutation boundary
   - service_role execution only

2. mta_internal.execute_movement_transaction
   - owner: postgres
   - SECURITY DEFINER: YES
   - direct movement writer
   - authenticated/anon execution was removed by PR #300 rollout
   - service_role execution remains

3. public.mta_resolve_qr
   - owner: postgres
   - SECURITY DEFINER: NO
   - resolver/read path, not a direct detainee writer

No additional production routine with mta_detainees in its function source was identified by the bounded catalog query.

## Database scheduling evidence

The production catalog does not expose the cron.job relation, and the installed extension inventory returned no pg_cron, pg_net, or pgmq extensions.

Therefore:

- no database-scheduled writer was identified through these facilities;
- this does not prove absence of external schedulers, CI jobs, operator scripts, or infrastructure-level jobs.

## Provenance conclusion

Administrative writer provenance is **NOT CLOSED**.

The current evidence proves:

- authenticated direct table DML is contained;
- internal movement SECURITY DEFINER execution is service-role-only;
- canonical runtime writer is mta-api;
- no pg_cron/pg_net/pgmq database scheduling facility was identified;
- postgres and supabase_admin retain privileged administrative capability.

The current evidence does NOT prove:

- who is authorized to exercise postgres/supabase_admin credentials;
- whether any external operator, automation, CI job, or infrastructure service can obtain or use those credentials;
- historical zero usage of administrative DML.

## Safety decision

Do not revoke postgres or supabase_admin capability as part of G1-X4.

The next step is provenance governance:

1. identify the governed administrative access path;
2. identify all non-Edge operational automation capable of using privileged credentials;
3. establish whether administrative DML is allowed only through migration/incident procedures;
4. capture or reconcile available audit/log evidence for administrative mutations;
5. only then determine whether an additional technical containment boundary is justified.

## Gate state

G1-X4 runtime privileged surface: PARTIALLY CLOSED

G1-X4 administrative provenance: BLOCKED

G1 certification: BLOCKED
