-- MTA DETENI QR resolver runtime hardening
-- Canonical resolver must never treat suspended/revoked/expired QR records as resolvable.
-- Scope/RBAC checks remain unchanged; this migration only tightens the final token-state gate.

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

  if coalesce(length(trim(p_token)),0) = 0 then
    raise exception using errcode='22023', message='QR_TOKEN_REQUIRED';
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
    and q.status = 'ACTIVE'
    and (q.expires_at is null or q.expires_at > now())
  limit 1;
end;
$$;

revoke all on function public.mta_resolve_qr(uuid,text,text) from public, anon;
grant execute on function public.mta_resolve_qr(uuid,text,text) to authenticated;

comment on function public.mta_resolve_qr(uuid,text,text) is
'Canonical QR resolver: authenticated + RBAC + scope constrained; only ACTIVE and non-expired QR records resolve.';
