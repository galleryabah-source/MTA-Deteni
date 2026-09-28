-- Narrow production hardening: the protected mta-api admin-users path uses
-- the Supabase service_role client for profile administration. Keep ordinary
-- authenticated access governed by RLS, while granting only the table
-- privileges required by that protected server-side path.
grant select, insert, update, delete on table public.mta_profiles to service_role;

comment on table public.mta_profiles is
  'MTA DETENI Auth/RBAC profile. Role defaults to VIEWER and is controlled by OWNER/ADMIN. Protected admin-users server path uses service_role table privileges; client roles remain RLS-governed.';
