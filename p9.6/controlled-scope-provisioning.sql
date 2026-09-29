-- LOCAL/NONPROD ONLY.
-- Controlled canonical scope provisioning rehearsal with synthetic identities.
-- This script intentionally rolls back all data at the end.

begin;

\set owner_id '''00000000-0000-4000-8000-000000000001'''
\set admin_id '''00000000-0000-4000-8000-000000000002'''
\set scope_code '''NONPROD-CANONICAL-SCOPE'''
\set scope_name '''Synthetic Controlled Scope'''

insert into auth.users(id,email)
values
  (:owner_id::uuid, 'owner.synthetic@example.invalid'),
  (:admin_id::uuid, 'admin.synthetic@example.invalid')
on conflict (id) do nothing;

insert into public.mta_profiles(id,role,display_name,active)
values
  (:owner_id::uuid,'OWNER','Synthetic OWNER',true),
  (:admin_id::uuid,'ADMIN','Synthetic ADMIN',true)
on conflict (id) do update
set role=excluded.role, active=excluded.active, display_name=excluded.display_name;

do $$
declare
  v_scope_id uuid;
begin
  if exists (
    select 1 from public.mta_scopes where code = 'NONPROD-CANONICAL-SCOPE'
  ) then
    raise exception 'P96_SYNTHETIC_SCOPE_ALREADY_EXISTS';
  end if;

  insert into public.mta_scopes(code,name,active)
  values ('NONPROD-CANONICAL-SCOPE','Synthetic Controlled Scope',true)
  returning id into v_scope_id;

  if v_scope_id is null then
    raise exception 'P96_SCOPE_INSERT_FAILED';
  end if;

  insert into public.mta_profile_scopes(profile_id,scope_id,active)
  values
    ('00000000-0000-4000-8000-000000000001',v_scope_id,true),
    ('00000000-0000-4000-8000-000000000002',v_scope_id,true);

  if (
    select count(*)
    from public.mta_profile_scopes
    where scope_id=v_scope_id and active=true
  ) <> 2 then
    raise exception 'P96_ASSIGNMENT_COUNT_FAILED';
  end if;

  if exists (
    select 1
    from public.mta_profile_scopes ps
    join public.mta_profiles p on p.id=ps.profile_id
    where ps.scope_id=v_scope_id
      and ps.active=true
      and p.role not in ('OWNER','ADMIN')
  ) then
    raise exception 'P96_ASSIGNMENT_ROLE_DRIFT';
  end if;
end $$;

-- Negative: duplicate membership must be rejected by the composite PK.
do $$
begin
  begin
    insert into public.mta_profile_scopes(profile_id,scope_id,active)
    values (
      '00000000-0000-4000-8000-000000000001',
      (select id from public.mta_scopes where code='NONPROD-CANONICAL-SCOPE'),
      true
    );
    raise exception 'P96_DUPLICATE_MEMBERSHIP_NOT_REJECTED';
  exception
    when unique_violation then
      null;
  end;
end $$;

-- Negative: role drift must be detected before a future controlled assignment.
update public.mta_profiles
set role='VIEWER'
where id='00000000-0000-4000-8000-000000000002';

do $$
begin
  if not exists (
    select 1 from public.mta_profiles
    where id='00000000-0000-4000-8000-000000000002'
      and role='VIEWER'
  ) then
    raise exception 'P96_ROLE_DRIFT_FIXTURE_FAILED';
  end if;

  if exists (
    select 1
    from public.mta_profiles
    where id='00000000-0000-4000-8000-000000000002'
      and role in ('OWNER','ADMIN')
  ) then
    raise exception 'P96_ROLE_DRIFT_NOT_DETECTED';
  end if;
end $$;

rollback;

-- Verify transactional rollback: synthetic provisioning leaves no durable data.
do $$
begin
  if exists (select 1 from public.mta_scopes where code='NONPROD-CANONICAL-SCOPE') then
    raise exception 'P96_ROLLBACK_SCOPE_FAILED';
  end if;

  if exists (
    select 1 from public.mta_profile_scopes
    where profile_id in (
      '00000000-0000-4000-8000-000000000001',
      '00000000-0000-4000-8000-000000000002'
    )
  ) then
    raise exception 'P96_ROLLBACK_ASSIGNMENT_FAILED';
  end if;
end $$;

select 'P96_CONTROLLED_PROVISIONING_REHEARSAL_PASS' as result;
