-- MTA DETENI canonical scope authorization + QR registry
-- Design: one explicit operational scope per detainee; users gain access through mta_profile_scopes.
-- QR resolution is performed by a SECURITY DEFINER function with explicit auth/RBAC/scope checks.
-- No raw QR token is stored.

create table if not exists public.mta_scopes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.mta_profile_scopes (
  profile_id uuid not null references public.mta_profiles(id) on delete cascade,
  scope_id uuid not null references public.mta_scopes(id) on delete cascade,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  primary key (profile_id, scope_id)
);

alter table public.mta_detainees
  add column if not exists scope_id uuid references public.mta_scopes(id) on delete restrict;

create index if not exists mta_detainees_scope_idx on public.mta_detainees(scope_id);
create index if not exists mta_profile_scopes_scope_idx on public.mta_profile_scopes(scope_id);

alter table public.mta_scopes enable row level security;
alter table public.mta_profile_scopes enable row level security;

revoke all on public.mta_scopes, public.mta_profile_scopes from anon, authenticated;
grant select on public.mta_scopes, public.mta_profile_scopes to authenticated;

drop policy if exists mta_scopes_select_authorized on public.mta_scopes;
create policy mta_scopes_select_authorized on public.mta_scopes
for select to authenticated
using (
  private.mta_current_role() in ('OWNER','ADMIN','AUDITOR')
  or exists (
    select 1 from public.mta_profile_scopes ps
    where ps.profile_id = (select auth.uid())
      and ps.scope_id = mta_scopes.id
      and ps.active = true
  )
);

drop policy if exists mta_profile_scopes_select_authorized on public.mta_profile_scopes;
create policy mta_profile_scopes_select_authorized on public.mta_profile_scopes
for select to authenticated
using (
  profile_id = (select auth.uid())
  or private.mta_current_role() in ('OWNER','ADMIN','AUDITOR')
);

drop policy if exists mta_detainees_select_scope on public.mta_detainees;
create policy mta_detainees_select_scope on public.mta_detainees
for select to authenticated
using (
  private.mta_current_role() in ('OWNER','ADMIN','AUDITOR')
  or exists (
    select 1 from public.mta_profile_scopes ps
    where ps.profile_id = (select auth.uid())
      and ps.scope_id = mta_detainees.scope_id
      and ps.active = true
  )
);

drop policy if exists mta_detainees_insert_scope on public.mta_detainees;
create policy mta_detainees_insert_scope on public.mta_detainees
for insert to authenticated
with check (
  private.mta_current_role() in ('OWNER','ADMIN','EDITOR')
  and (
    private.mta_current_role() in ('OWNER','ADMIN')
    or exists (
      select 1 from public.mta_profile_scopes ps
      where ps.profile_id = (select auth.uid())
        and ps.scope_id = mta_detainees.scope_id
        and ps.active = true
    )
  )
);

drop policy if exists mta_detainees_update_scope on public.mta_detainees;
create policy mta_detainees_update_scope on public.mta_detainees
for update to authenticated
using (
  private.mta_current_role() in ('OWNER','ADMIN','EDITOR')
  and (
    private.mta_current_role() in ('OWNER','ADMIN')
    or exists (
      select 1 from public.mta_profile_scopes ps
      where ps.profile_id = (select auth.uid())
        and ps.scope_id = mta_detainees.scope_id
        and ps.active = true
    )
  )
)
with check (
  private.mta_current_role() in ('OWNER','ADMIN','EDITOR')
  and (
    private.mta_current_role() in ('OWNER','ADMIN')
    or exists (
      select 1 from public.mta_profile_scopes ps
      where ps.profile_id = (select auth.uid())
        and ps.scope_id = mta_detainees.scope_id
        and ps.active = true
    )
  )
);

drop policy if exists mta_detainees_delete_scope on public.mta_detainees;
create policy mta_detainees_delete_scope on public.mta_detainees
for delete to authenticated
using (
  private.mta_current_role() in ('OWNER','ADMIN')
  and (
    private.mta_current_role() in ('OWNER','ADMIN')
    or exists (
      select 1 from public.mta_profile_scopes ps
      where ps.profile_id = (select auth.uid())
        and ps.scope_id = mta_detainees.scope_id
        and ps.active = true
    )
  )
);

create table if not exists public.mta_qr_registry (
  id uuid primary key default gen_random_uuid(),
  resource_type text not null default 'DETAINEE' check (resource_type = 'DETAINEE'),
  resource_id uuid not null references public.mta_detainees(id) on delete restrict,
  token_hash text not null,
  token_version integer not null default 1 check (token_version > 0),
  status text not null default 'ACTIVE' check (status in ('ACTIVE','SUSPENDED','REVOKED')),
  context text not null default 'RUDENIM_STAY' check (context = 'RUDENIM_STAY'),
  issued_at timestamptz not null default now(),
  expires_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  revoked_at timestamptz,
  revoked_by uuid references auth.users(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(resource_id, token_hash)
);

create unique index if not exists mta_qr_registry_active_token_idx
on public.mta_qr_registry(resource_id, token_hash)
where status = 'ACTIVE';

create index if not exists mta_qr_registry_resource_idx
on public.mta_qr_registry(resource_id, status);

alter table public.mta_qr_registry enable row level security;
revoke all on public.mta_qr_registry from anon, authenticated;

drop policy if exists mta_qr_registry_select_scope on public.mta_qr_registry;
create policy mta_qr_registry_select_scope on public.mta_qr_registry
for select to authenticated
using (
  private.mta_current_role() in ('OWNER','ADMIN','AUDITOR')
  or exists (
    select 1
    from public.mta_detainees d
    join public.mta_profile_scopes ps on ps.scope_id = d.scope_id
    where d.id = mta_qr_registry.resource_id
      and ps.profile_id = (select auth.uid())
      and ps.active = true
  )
);

drop policy if exists mta_qr_registry_write_scope on public.mta_qr_registry;
create policy mta_qr_registry_write_scope on public.mta_qr_registry
for all to authenticated
using (
  private.mta_current_role() in ('OWNER','ADMIN')
  or (
    private.mta_current_role() = 'EDITOR'
    and exists (
      select 1
      from public.mta_detainees d
      join public.mta_profile_scopes ps on ps.scope_id = d.scope_id
      where d.id = mta_qr_registry.resource_id
        and ps.profile_id = (select auth.uid())
        and ps.active = true
    )
  )
)
with check (
  private.mta_current_role() in ('OWNER','ADMIN')
  or (
    private.mta_current_role() = 'EDITOR'
    and exists (
      select 1
      from public.mta_detainees d
      join public.mta_profile_scopes ps on ps.scope_id = d.scope_id
      where d.id = mta_qr_registry.resource_id
        and ps.profile_id = (select auth.uid())
        and ps.active = true
    )
  )
);

create or replace function public.mta_resolve_qr(
  p_resource_id uuid,
  p_token text,
  p_expected_context text default 'RUDENIM_STAY'
)
returns table (
  resource_id uuid,
  resource_type text,
  status text,
  context text,
  issued_at timestamptz,
  expires_at timestamptz
)
language plpgsql
stable
security definer
set search_path = pg_catalog, public, extensions
as $$
declare
  v_role text;
  v_hash text;
begin
  if auth.uid() is null then
    raise exception using errcode='42501', message='AUTH_REQUIRED';
  end if;

  select role into v_role
  from public.mta_profiles
  where id = auth.uid() and active = true;

  if v_role is null then
    raise exception using errcode='42501', message='RBAC_PROFILE_MISSING_OR_INACTIVE';
  end if;

  if not exists (
    select 1
    from public.mta_detainees d
    where d.id = p_resource_id
      and (
        v_role in ('OWNER','ADMIN','AUDITOR')
        or exists (
          select 1 from public.mta_profile_scopes ps
          where ps.profile_id = auth.uid()
            and ps.scope_id = d.scope_id
            and ps.active = true
        )
      )
  ) then
    raise exception using errcode='42501', message='QR_SCOPE_DENIED';
  end if;

  v_hash := encode(digest(convert_to(p_token,'utf8'),'sha256'),'hex');

  return query
  select q.resource_id,q.resource_type,q.status,q.context,q.issued_at,q.expires_at
  from public.mta_qr_registry q
  where q.resource_id = p_resource_id
    and q.token_hash = v_hash
    and q.resource_type = 'DETAINEE'
    and q.context = p_expected_context
  limit 1;
end;
$$;

revoke all on function public.mta_resolve_qr(uuid,text,text) from public, anon;
grant execute on function public.mta_resolve_qr(uuid,text,text) to authenticated;

comment on table public.mta_scopes is 'Canonical MTA DETENI authorization scopes.';
comment on table public.mta_profile_scopes is 'Active profile-to-scope authorization membership.';
comment on table public.mta_qr_registry is 'Canonical opaque QR registry. Raw tokens are never persisted.';
