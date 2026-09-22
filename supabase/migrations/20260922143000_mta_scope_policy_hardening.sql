-- Scope authorization hardening after live-policy audit.
-- Remove legacy broad policies and make detainee scope mandatory.
alter table public.mta_detainees alter column scope_id set not null;

drop policy if exists mta_detainees_select_auth on public.mta_detainees;
drop policy if exists mta_detainees_insert_editor on public.mta_detainees;
drop policy if exists mta_detainees_update_editor on public.mta_detainees;
drop policy if exists mta_detainees_delete_admin on public.mta_detainees;

drop policy if exists mta_placements_select_auth on public.mta_placements;
drop policy if exists mta_placements_write_editor on public.mta_placements;
drop policy if exists mta_placements_select_scope on public.mta_placements;
drop policy if exists mta_placements_insert_scope on public.mta_placements;
drop policy if exists mta_placements_update_scope on public.mta_placements;
drop policy if exists mta_placements_delete_scope on public.mta_placements;

create policy mta_placements_select_scope on public.mta_placements
for select to authenticated using (
  private.mta_current_role() in ('OWNER','ADMIN','AUDITOR')
  or exists (
    select 1 from public.mta_detainees d
    join public.mta_profile_scopes ps on ps.scope_id=d.scope_id
    where d.id=mta_placements.detainee_id
      and ps.profile_id=(select auth.uid()) and ps.active=true
  )
);
create policy mta_placements_insert_scope on public.mta_placements
for insert to authenticated with check (
  private.mta_current_role() in ('OWNER','ADMIN')
  or (private.mta_current_role()='EDITOR' and exists (
    select 1 from public.mta_detainees d join public.mta_profile_scopes ps on ps.scope_id=d.scope_id
    where d.id=mta_placements.detainee_id and ps.profile_id=(select auth.uid()) and ps.active=true
  ))
);
create policy mta_placements_update_scope on public.mta_placements
for update to authenticated using (
  private.mta_current_role() in ('OWNER','ADMIN')
  or (private.mta_current_role()='EDITOR' and exists (
    select 1 from public.mta_detainees d join public.mta_profile_scopes ps on ps.scope_id=d.scope_id
    where d.id=mta_placements.detainee_id and ps.profile_id=(select auth.uid()) and ps.active=true
  ))
) with check (
  private.mta_current_role() in ('OWNER','ADMIN')
  or (private.mta_current_role()='EDITOR' and exists (
    select 1 from public.mta_detainees d join public.mta_profile_scopes ps on ps.scope_id=d.scope_id
    where d.id=mta_placements.detainee_id and ps.profile_id=(select auth.uid()) and ps.active=true
  ))
);
create policy mta_placements_delete_scope on public.mta_placements
for delete to authenticated using (private.mta_current_role() in ('OWNER','ADMIN'));

drop policy if exists mta_movements_select_auth on public.mta_movements;
drop policy if exists mta_movements_write_editor on public.mta_movements;
drop policy if exists mta_movements_select_scope on public.mta_movements;
drop policy if exists mta_movements_insert_scope on public.mta_movements;
drop policy if exists mta_movements_update_scope on public.mta_movements;
drop policy if exists mta_movements_delete_scope on public.mta_movements;

create policy mta_movements_select_scope on public.mta_movements
for select to authenticated using (
 private.mta_current_role() in ('OWNER','ADMIN','AUDITOR')
 or exists(select 1 from public.mta_detainees d join public.mta_profile_scopes ps on ps.scope_id=d.scope_id where d.id=mta_movements.detainee_id and ps.profile_id=(select auth.uid()) and ps.active=true)
);
create policy mta_movements_insert_scope on public.mta_movements
for insert to authenticated with check (
 private.mta_current_role() in ('OWNER','ADMIN')
 or (private.mta_current_role()='EDITOR' and exists(select 1 from public.mta_detainees d join public.mta_profile_scopes ps on ps.scope_id=d.scope_id where d.id=mta_movements.detainee_id and ps.profile_id=(select auth.uid()) and ps.active=true))
);
create policy mta_movements_update_scope on public.mta_movements
for update to authenticated using (
 private.mta_current_role() in ('OWNER','ADMIN')
 or (private.mta_current_role()='EDITOR' and exists(select 1 from public.mta_detainees d join public.mta_profile_scopes ps on ps.scope_id=d.scope_id where d.id=mta_movements.detainee_id and ps.profile_id=(select auth.uid()) and ps.active=true))
) with check (
 private.mta_current_role() in ('OWNER','ADMIN')
 or (private.mta_current_role()='EDITOR' and exists(select 1 from public.mta_detainees d join public.mta_profile_scopes ps on ps.scope_id=d.scope_id where d.id=mta_movements.detainee_id and ps.profile_id=(select auth.uid()) and ps.active=true))
);
create policy mta_movements_delete_scope on public.mta_movements for delete to authenticated using (private.mta_current_role() in ('OWNER','ADMIN'));

drop policy if exists mta_leaves_select_auth on public.mta_leaves;
drop policy if exists mta_leaves_write_editor on public.mta_leaves;
drop policy if exists mta_leaves_select_scope on public.mta_leaves;
drop policy if exists mta_leaves_insert_scope on public.mta_leaves;
drop policy if exists mta_leaves_update_scope on public.mta_leaves;
drop policy if exists mta_leaves_delete_scope on public.mta_leaves;

create policy mta_leaves_select_scope on public.mta_leaves
for select to authenticated using (
 private.mta_current_role() in ('OWNER','ADMIN','AUDITOR')
 or exists(select 1 from public.mta_detainees d join public.mta_profile_scopes ps on ps.scope_id=d.scope_id where d.id=mta_leaves.detainee_id and ps.profile_id=(select auth.uid()) and ps.active=true)
);
create policy mta_leaves_insert_scope on public.mta_leaves
for insert to authenticated with check (
 private.mta_current_role() in ('OWNER','ADMIN')
 or (private.mta_current_role()='EDITOR' and exists(select 1 from public.mta_detainees d join public.mta_profile_scopes ps on ps.scope_id=d.scope_id where d.id=mta_leaves.detainee_id and ps.profile_id=(select auth.uid()) and ps.active=true))
);
create policy mta_leaves_update_scope on public.mta_leaves
for update to authenticated using (
 private.mta_current_role() in ('OWNER','ADMIN')
 or (private.mta_current_role()='EDITOR' and exists(select 1 from public.mta_detainees d join public.mta_profile_scopes ps on ps.scope_id=d.scope_id where d.id=mta_leaves.detainee_id and ps.profile_id=(select auth.uid()) and ps.active=true))
) with check (
 private.mta_current_role() in ('OWNER','ADMIN')
 or (private.mta_current_role()='EDITOR' and exists(select 1 from public.mta_detainees d join public.mta_profile_scopes ps on ps.scope_id=d.scope_id where d.id=mta_leaves.detainee_id and ps.profile_id=(select auth.uid()) and ps.active=true))
);
create policy mta_leaves_delete_scope on public.mta_leaves for delete to authenticated using (private.mta_current_role() in ('OWNER','ADMIN'));