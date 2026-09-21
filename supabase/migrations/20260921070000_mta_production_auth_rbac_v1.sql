-- Production Auth/RBAC v1
-- Applied to Supabase production project tmmhxqgzelgrsrxbbfzh.
-- Default role is VIEWER; OWNER/ADMIN control role changes.

create table if not exists public.mta_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'VIEWER' check (role in ('OWNER','ADMIN','EDITOR','REVIEWER','AUDITOR','VIEWER')),
  display_name text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.mta_current_role() returns text
language sql stable security definer set search_path = pg_catalog, public
as $$ select role from public.mta_profiles where id = auth.uid() and active = true limit 1 $$;

revoke all on function public.mta_current_role() from public;
grant execute on function public.mta_current_role() to authenticated;

create or replace function public.mta_bootstrap_profile() returns trigger
language plpgsql security definer set search_path = pg_catalog, public
as $$
begin
  insert into public.mta_profiles(id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.email))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_mta_profile on auth.users;
create trigger on_auth_user_created_mta_profile after insert on auth.users
for each row execute function public.mta_bootstrap_profile();

insert into public.mta_profiles(id, display_name)
select id, coalesce(raw_user_meta_data->>'full_name', email) from auth.users
on conflict (id) do nothing;

alter table public.mta_profiles enable row level security;
revoke all on public.mta_profiles from anon, authenticated;

drop policy if exists mta_profiles_select on public.mta_profiles;
create policy mta_profiles_select on public.mta_profiles for select to authenticated
using (id = auth.uid() or public.mta_current_role() in ('OWNER','ADMIN','AUDITOR'));

drop policy if exists mta_profiles_update_admin on public.mta_profiles;
create policy mta_profiles_update_admin on public.mta_profiles for update to authenticated
using (public.mta_current_role() in ('OWNER','ADMIN'))
with check (public.mta_current_role() in ('OWNER','ADMIN'));
grant select on public.mta_profiles to authenticated;

-- Domain read/write policies
drop policy if exists mta_detainees_select_auth on public.mta_detainees;
create policy mta_detainees_select_auth on public.mta_detainees for select to authenticated using (true);
drop policy if exists mta_detainees_insert_editor on public.mta_detainees;
create policy mta_detainees_insert_editor on public.mta_detainees for insert to authenticated with check (public.mta_current_role() in ('OWNER','ADMIN','EDITOR'));
drop policy if exists mta_detainees_update_editor on public.mta_detainees;
create policy mta_detainees_update_editor on public.mta_detainees for update to authenticated using (public.mta_current_role() in ('OWNER','ADMIN','EDITOR')) with check (public.mta_current_role() in ('OWNER','ADMIN','EDITOR'));
drop policy if exists mta_detainees_delete_admin on public.mta_detainees;
create policy mta_detainees_delete_admin on public.mta_detainees for delete to authenticated using (public.mta_current_role() in ('OWNER','ADMIN'));

drop policy if exists mta_placements_select_auth on public.mta_placements;
create policy mta_placements_select_auth on public.mta_placements for select to authenticated using (true);
drop policy if exists mta_placements_write_editor on public.mta_placements;
create policy mta_placements_write_editor on public.mta_placements for all to authenticated using (public.mta_current_role() in ('OWNER','ADMIN','EDITOR')) with check (public.mta_current_role() in ('OWNER','ADMIN','EDITOR'));

drop policy if exists mta_movements_select_auth on public.mta_movements;
create policy mta_movements_select_auth on public.mta_movements for select to authenticated using (true);
drop policy if exists mta_movements_write_editor on public.mta_movements;
create policy mta_movements_write_editor on public.mta_movements for all to authenticated using (public.mta_current_role() in ('OWNER','ADMIN','EDITOR')) with check (public.mta_current_role() in ('OWNER','ADMIN','EDITOR'));

drop policy if exists mta_leaves_select_auth on public.mta_leaves;
create policy mta_leaves_select_auth on public.mta_leaves for select to authenticated using (true);
drop policy if exists mta_leaves_write_editor on public.mta_leaves;
create policy mta_leaves_write_editor on public.mta_leaves for all to authenticated using (public.mta_current_role() in ('OWNER','ADMIN','EDITOR')) with check (public.mta_current_role() in ('OWNER','ADMIN','EDITOR'));

drop policy if exists mta_documents_select_auth on public.mta_documents;
create policy mta_documents_select_auth on public.mta_documents for select to authenticated using (true);
drop policy if exists mta_documents_insert_editor on public.mta_documents;
create policy mta_documents_insert_editor on public.mta_documents for insert to authenticated with check (public.mta_current_role() in ('OWNER','ADMIN','EDITOR'));
drop policy if exists mta_documents_update_editor on public.mta_documents;
create policy mta_documents_update_editor on public.mta_documents for update to authenticated using (public.mta_current_role() in ('OWNER','ADMIN','EDITOR')) with check (public.mta_current_role() in ('OWNER','ADMIN','EDITOR'));
drop policy if exists mta_documents_delete_admin on public.mta_documents;
create policy mta_documents_delete_admin on public.mta_documents for delete to authenticated using (public.mta_current_role() in ('OWNER','ADMIN'));

drop policy if exists mta_audit_select_authorized on public.mta_audit_events;
create policy mta_audit_select_authorized on public.mta_audit_events for select to authenticated using (public.mta_current_role() in ('OWNER','ADMIN','AUDITOR'));

create or replace function public.mta_audit_row_change() returns trigger
language plpgsql security definer set search_path = pg_catalog, public
as $$
declare rid text;
begin
  rid := coalesce((case when tg_op='DELETE' then old.id else new.id end)::text, '');
  insert into public.mta_audit_events(action,resource_type,resource_id,result,actor_user_id,metadata)
  values ('DB_'||tg_op,tg_table_name,rid,'SUCCESS',auth.uid(),jsonb_build_object('table',tg_table_name,'operation',tg_op));
  return coalesce(new,old);
end;
$$;

drop trigger if exists mta_audit_detainees on public.mta_detainees;
create trigger mta_audit_detainees after insert or update or delete on public.mta_detainees for each row execute function public.mta_audit_row_change();
drop trigger if exists mta_audit_placements on public.mta_placements;
create trigger mta_audit_placements after insert or update or delete on public.mta_placements for each row execute function public.mta_audit_row_change();
drop trigger if exists mta_audit_movements on public.mta_movements;
create trigger mta_audit_movements after insert or update or delete on public.mta_movements for each row execute function public.mta_audit_row_change();
drop trigger if exists mta_audit_leaves on public.mta_leaves;
create trigger mta_audit_leaves after insert or update or delete on public.mta_leaves for each row execute function public.mta_audit_row_change();
drop trigger if exists mta_audit_documents on public.mta_documents;
create trigger mta_audit_documents after insert or update or delete on public.mta_documents for each row execute function public.mta_audit_row_change();

drop policy if exists mta_storage_metadata_select_authorized on public.mta_storage_objects;
create policy mta_storage_metadata_select_authorized on public.mta_storage_objects for select to authenticated using (public.mta_current_role() in ('OWNER','ADMIN','EDITOR','REVIEWER','AUDITOR'));
drop policy if exists mta_storage_metadata_insert_editor on public.mta_storage_objects;
create policy mta_storage_metadata_insert_editor on public.mta_storage_objects for insert to authenticated with check (public.mta_current_role() in ('OWNER','ADMIN','EDITOR'));

drop policy if exists mta_storage_read_authenticated on storage.objects;
create policy mta_storage_read_authenticated on storage.objects for select to authenticated using (bucket_id='mta-deteni-private' and public.mta_current_role() in ('OWNER','ADMIN','EDITOR','REVIEWER','AUDITOR'));
drop policy if exists mta_storage_insert_editor on storage.objects;
create policy mta_storage_insert_editor on storage.objects for insert to authenticated with check (bucket_id='mta-deteni-private' and public.mta_current_role() in ('OWNER','ADMIN','EDITOR'));
drop policy if exists mta_storage_update_editor on storage.objects;
create policy mta_storage_update_editor on storage.objects for update to authenticated using (bucket_id='mta-deteni-private' and public.mta_current_role() in ('OWNER','ADMIN','EDITOR')) with check (bucket_id='mta-deteni-private' and public.mta_current_role() in ('OWNER','ADMIN','EDITOR'));
drop policy if exists mta_storage_delete_admin on storage.objects;
create policy mta_storage_delete_admin on storage.objects for delete to authenticated using (bucket_id='mta-deteni-private' and public.mta_current_role() in ('OWNER','ADMIN'));

comment on table public.mta_profiles is 'MTA DETENI Auth/RBAC profile. Role defaults to VIEWER and is controlled by OWNER/ADMIN.';
