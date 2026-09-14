-- P10.12 PROPOSED MIGRATION — NOT EXECUTED
-- Migration Freeze is active. This file is a review artifact only.
-- Execute only through the approved Supabase migration mechanism after governance approval.

create table if not exists public.artifact_download_grants (
  grant_id text primary key,
  document_id text not null,
  artifact_id text not null,
  artifact_sha256 text not null,
  object_id text not null,
  actor_id text not null,
  scope_id text not null,
  issued_at timestamptz not null,
  expires_at timestamptz not null,
  status text not null default 'ACTIVE',
  consumed_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  constraint artifact_download_grants_status_ck
    check (status in ('ACTIVE', 'CONSUMED', 'REVOKED')),
  constraint artifact_download_grants_checksum_ck
    check (artifact_sha256 ~ '^[0-9a-fA-F]{64}$'),
  constraint artifact_download_grants_expiry_ck
    check (expires_at > issued_at),
  constraint artifact_download_grants_consumed_state_ck
    check ((status = 'CONSUMED') = (consumed_at is not null)),
  constraint artifact_download_grants_revoked_state_ck
    check ((status = 'REVOKED') = (revoked_at is not null))
);

create index if not exists artifact_download_grants_document_idx
  on public.artifact_download_grants (document_id);

create index if not exists artifact_download_grants_actor_scope_idx
  on public.artifact_download_grants (actor_id, scope_id, status);

create index if not exists artifact_download_grants_expiry_idx
  on public.artifact_download_grants (expires_at)
  where status = 'ACTIVE';

alter table public.artifact_download_grants enable row level security;

-- No anonymous/public grants. Application/server integration must use an approved
-- server-side database role and preserve the ACP decision before repository access.
revoke all on table public.artifact_download_grants from anon;
revoke all on table public.artifact_download_grants from authenticated;
revoke all on table public.artifact_download_grants from public;

-- The following authenticated policies are intentionally NOT included here until
-- the final identity-to-actor and scope-claim contract is approved. A permissive
-- placeholder policy would weaken the deny-by-default boundary.
-- service_role/server adapter access must be provisioned explicitly during the
-- controlled integration window.
