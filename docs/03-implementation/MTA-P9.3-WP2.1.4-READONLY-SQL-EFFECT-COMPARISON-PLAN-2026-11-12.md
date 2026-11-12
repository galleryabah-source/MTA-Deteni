# P9.3 WP2.1.4 — Read-only SQL Effect Comparison Plan

**Date:** 2026-11-12  
**Repository:** `galleryabah-source/MTA-Deteni`  
**Production project:** `tmmhxqgzelgrsrxbbfzh`  
**Mode:** Prepared read-only catalog inspection; queries in this document have NOT been executed successfully.  
**Status:** PREPARED — BLOCKED BY DATABASE CONNECTION AUTHENTICATION

## 1. Safety contract

- `MIGRATION_FREEZE = TRUE`
- No DDL/DML, migration apply, migration-history repair, or data mutation.
- No Auth, Storage, RLS, policy, grant, secret, or project-setting changes.
- No deployment.
- Only catalog metadata and function definitions may be read.
- Do not query operational detainee records, credentials, NIP values, audit payloads, Vault values, or other sensitive business data.
- Execute these statements only through an authenticated read-only connection after the connection issue is resolved.
- Each query is SELECT-only; do not wrap this plan in a script that applies or repairs schema.

## 2. Connection blocker observed

A fresh `mcp__Supabase__execute_sql` attempt on 2026-11-12 returned PostgreSQL SQLSTATE `28P01`:
`password authentication failed for user "postgres"`.

A separate `mcp__Supabase__list_tables` attempt returned SQLSTATE `28P01` for `supabase_read_only_user`.

Both operations failed before returning query results. No SQL statement was executed and no mutation occurred. Stop retrying the same path until the Supabase connection/credential issue is corrected through the authorized connector/session process. Do not attempt credential rotation or project setting changes from this work package.

## 3. Catalog comparison query pack

### Q1 — Migration history (version/name only)

```sql
select version, name
from supabase_migrations.schema_migrations
order by version, name;
```

Expected use: confirm the 44-entry inventory and map live version/name to recovered source artifacts. Do not update this table.

### Q2 — Relevant relations, columns, constraints, and indexes

```sql
select
  n.nspname as schema_name,
  c.relname as relation_name,
  c.relkind,
  a.attname as column_name,
  pg_catalog.format_type(a.atttypid, a.atttypmod) as data_type,
  a.attnotnull as not_null,
  pg_get_expr(ad.adbin, ad.adrelid) as column_default
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
left join pg_attribute a on a.attrelid = c.oid
  and a.attnum > 0 and not a.attisdropped
left join pg_attrdef ad on ad.adrelid = c.oid and ad.adnum = a.attnum
where n.nspname in ('public', 'private', 'mta_internal')
  and c.relname in (
    'mta_profiles','mta_profile_scopes','mta_detainees',
    'mta_placements','mta_movements','mta_leaves','mta_documents',
    'mta_qr_registry','mta_audit_events','mta_audit_chain_epochs',
    'outbox_events','idempotency_keys','mta_ai_config'
  )
order by n.nspname, c.relname, a.attnum;
```

### Q3 — Constraints and indexes

```sql
select
  n.nspname as schema_name,
  t.relname as table_name,
  con.conname as object_name,
  'CONSTRAINT' as object_type,
  pg_get_constraintdef(con.oid, true) as definition
from pg_constraint con
join pg_class t on t.oid = con.conrelid
join pg_namespace n on n.oid = t.relnamespace
where n.nspname in ('public','mta_internal')
  and t.relname in (
    'mta_profiles','mta_qr_registry','mta_audit_events',
    'outbox_events','idempotency_keys'
  )
union all
select
  schemaname,
  tablename,
  indexname,
  'INDEX',
  indexdef
from pg_indexes
where schemaname in ('public','mta_internal')
  and tablename in (
    'mta_profiles','mta_qr_registry','mta_audit_events',
    'outbox_events','idempotency_keys'
  )
order by 1,2,3;
```

### Q4 — Function definitions and execution properties

```sql
select
  n.nspname as schema_name,
  p.proname as function_name,
  pg_get_function_identity_arguments(p.oid) as identity_arguments,
  pg_get_function_result(p.oid) as result_type,
  l.lanname as language,
  p.prosecdef as security_definer,
  p.provolatile as volatility,
  p.proconfig as function_settings,
  pg_get_userbyid(p.proowner) as owner,
  pg_get_functiondef(p.oid) as definition
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
join pg_language l on l.oid = p.prolang
where n.nspname in ('public','private','mta_internal')
  and p.proname in (
    'mta_current_role','mta_resolve_qr',
    'execute_idempotent_mutation','mta_execute_idempotent_mutation',
    'claim_outbox_events','release_outbox_event','complete_outbox_event',
    'execute_movement_transaction','mta_execute_movement_transaction',
    'mta_verify_audit_integrity','mta_create_detainee_note_transaction',
    'mta_set_ai_secret','mta_get_ai_secret','mta_clear_ai_secret'
  )
order by n.nspname, p.proname, identity_arguments;
```

### Q5 — Effective function EXECUTE ACLs

```sql
select
  n.nspname as schema_name,
  p.proname as function_name,
  pg_get_function_identity_arguments(p.oid) as identity_arguments,
  coalesce(grantee.rolname, 'PUBLIC') as grantee,
  x.privilege_type,
  x.is_grantable
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
cross join lateral aclexplode(coalesce(p.proacl, acldefault('f', p.proowner))) x
left join pg_roles grantee on grantee.oid = x.grantee
where n.nspname in ('public','private','mta_internal')
  and p.proname in (
    'mta_current_role','mta_resolve_qr',
    'execute_idempotent_mutation','mta_execute_idempotent_mutation',
    'claim_outbox_events','release_outbox_event','complete_outbox_event',
    'execute_movement_transaction','mta_execute_movement_transaction',
    'mta_verify_audit_integrity','mta_create_detainee_note_transaction'
  )
order by n.nspname, p.proname, identity_arguments, grantee;
```

### Q6 — RLS state and policies

```sql
select
  n.nspname as schema_name,
  c.relname as table_name,
  c.relrowsecurity as rls_enabled,
  c.relforcerowsecurity as force_rls,
  pol.polname as policy_name,
  pol.polcmd as command,
  pol.polpermissive as permissive,
  array(
    select r.rolname
    from unnest(pol.polroles) role_oid
    join pg_roles r on r.oid = role_oid
  ) as roles,
  pg_get_expr(pol.polqual, pol.polrelid) as using_expression,
  pg_get_expr(pol.polwithcheck, pol.polrelid) as with_check_expression
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
left join pg_policy pol on pol.polrelid = c.oid
where n.nspname in ('public','mta_internal')
  and c.relname in (
    'mta_profiles','mta_profile_scopes','mta_detainees',
    'mta_placements','mta_movements','mta_leaves','mta_documents',
    'mta_qr_registry','mta_audit_events','mta_audit_chain_epochs',
    'outbox_events','idempotency_keys','mta_ai_config'
  )
order by n.nspname, c.relname, pol.polname;
```

### Q7 — Trigger definitions

```sql
select
  n.nspname as schema_name,
  c.relname as table_name,
  t.tgname as trigger_name,
  pg_get_triggerdef(t.oid, true) as definition,
  p.proname as trigger_function,
  pn.nspname as trigger_function_schema
from pg_trigger t
join pg_class c on c.oid = t.tgrelid
join pg_namespace n on n.oid = c.relnamespace
join pg_proc p on p.oid = t.tgfoid
join pg_namespace pn on pn.oid = p.pronamespace
where not t.tgisinternal
  and n.nspname in ('public','private','mta_internal')
  and c.relname in ('mta_audit_events','mta_profiles','mta_detainees')
order by n.nspname, c.relname, t.tgname;
```

### Q8 — Table and schema privileges

```sql
select
  table_schema,
  table_name,
  grantee,
  privilege_type,
  is_grantable
from information_schema.role_table_grants
where table_schema in ('public','mta_internal')
  and table_name in (
    'mta_profiles','mta_detainees','mta_placements','mta_movements',
    'mta_leaves','mta_documents','mta_qr_registry','mta_audit_events',
    'mta_audit_chain_epochs','outbox_events','idempotency_keys','mta_ai_config'
  )
order by table_schema, table_name, grantee, privilege_type;
```

## 4. Comparison protocol

For every live migration entry, create one comparison row with:

- live version and name;
- recovered branch/ref, source path, blob SHA, PR/commit;
- expected object effects from source SQL;
- observed catalog effects from Q1–Q8;
- differences and uncertainty;
- classification and reviewer.

Use only these final classifications:

- `EXACT_MATCH`: source file and live version mapping verified, and relevant effect definitions/ACLs match.
- `SAME_EFFECT_RECONSTRUCTED`: source file/version differs but all relevant schema, policy, function, trigger, grant, constraint, and index effects match.
- `LIVE_ONLY`: authoritative source absent after documented search and live effect confirmed.
- `REPO_ONLY`: source exists but its effect is absent from live catalog and migration history; do not infer from filename alone.
- `UNRESOLVED`: evidence is missing, blocked, or conflicting.

Do not upgrade any row from source discovery alone. A prior manifest's assertion of a semantic match is a lead to verify, not a substitute for the query results.

## 5. Prioritized comparison groups

1. Authentication kernel: `mta_current_role`, `mta_profiles.must_change_password`, profile active state, session-aware predicates (if any), and function ACL.
2. QR/security grants: `mta_resolve_qr`, `mta_qr_registry` policies, authenticated grants and indexes.
3. P9.7/P9.8: idempotency/outbox tables, functions, wrappers, constraints, indexes, and EXECUTE grants.
4. Audit chain: `mta_audit_events` columns, triggers, verifier, epochs RLS and ACL.
5. Document/storage: metadata policies and Storage object policy/linkage boundaries.
6. Identity: NIP column, check constraint, unique index, and assignment audit functions.
7. Remaining AI migration provenance: do not reconstruct SQL from live catalog.

## 6. Current gate

WP2.1.3 source discovery has materially advanced. WP2.1.4 live effect comparison is **PREPARED BUT BLOCKED** by PostgreSQL authentication failure. The query pack above is not evidence of observed production state; it is a controlled inspection plan only.

**WP2.1 = PARTIAL — NOT CERTIFIED.**  
**P9.3 = FORENSIC IN PROGRESS — NOT CERTIFIED.**  
**No production mutation or deployment is authorized.**
