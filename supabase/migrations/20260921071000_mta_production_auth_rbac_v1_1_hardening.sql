-- Production Auth/RBAC v1.1 hardening
-- Applied to Supabase production project tmmhxqgzelgrsrxbbfzh.

revoke all on function public.mta_audit_row_change() from public, anon, authenticated;
revoke all on function public.mta_bootstrap_profile() from public, anon, authenticated;
grant execute on function public.mta_current_role() to authenticated;

drop policy if exists mta_ai_jobs_deny_all on public.mta_ai_jobs;
create policy mta_ai_jobs_deny_all on public.mta_ai_jobs for all to authenticated using (false) with check (false);

drop policy if exists mta_profiles_select on public.mta_profiles;
create policy mta_profiles_select on public.mta_profiles for select to authenticated
using (id = (select auth.uid()) or public.mta_current_role() in ('OWNER','ADMIN','AUDITOR'));

drop policy if exists mta_placements_write_editor on public.mta_placements;
create policy mta_placements_insert_editor on public.mta_placements for insert to authenticated with check (public.mta_current_role() in ('OWNER','ADMIN','EDITOR'));
create policy mta_placements_update_editor on public.mta_placements for update to authenticated using (public.mta_current_role() in ('OWNER','ADMIN','EDITOR')) with check (public.mta_current_role() in ('OWNER','ADMIN','EDITOR'));
create policy mta_placements_delete_admin on public.mta_placements for delete to authenticated using (public.mta_current_role() in ('OWNER','ADMIN'));

drop policy if exists mta_movements_write_editor on public.mta_movements;
create policy mta_movements_insert_editor on public.mta_movements for insert to authenticated with check (public.mta_current_role() in ('OWNER','ADMIN','EDITOR'));
create policy mta_movements_update_editor on public.mta_movements for update to authenticated using (public.mta_current_role() in ('OWNER','ADMIN','EDITOR')) with check (public.mta_current_role() in ('OWNER','ADMIN','EDITOR'));
create policy mta_movements_delete_admin on public.mta_movements for delete to authenticated using (public.mta_current_role() in ('OWNER','ADMIN'));

drop policy if exists mta_leaves_write_editor on public.mta_leaves;
create policy mta_leaves_insert_editor on public.mta_leaves for insert to authenticated with check (public.mta_current_role() in ('OWNER','ADMIN','EDITOR'));
create policy mta_leaves_update_editor on public.mta_leaves for update to authenticated using (public.mta_current_role() in ('OWNER','ADMIN','EDITOR')) with check (public.mta_current_role() in ('OWNER','ADMIN','EDITOR'));
create policy mta_leaves_delete_admin on public.mta_leaves for delete to authenticated using (public.mta_current_role() in ('OWNER','ADMIN'));
