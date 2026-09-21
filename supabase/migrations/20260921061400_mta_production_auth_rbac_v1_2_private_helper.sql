-- Production Auth/RBAC v1.2 hardening
-- Applied to Supabase production project tmmhxqgzelgrsrxbbfzh.
-- Move the SECURITY DEFINER role helper into the non-exposed private schema.

create schema if not exists private;
alter function public.mta_current_role() set schema private;
alter function private.mta_current_role() set search_path='';
revoke all on function private.mta_current_role() from public, anon, authenticated;
grant usage on schema private to authenticated;
grant execute on function private.mta_current_role() to authenticated;
