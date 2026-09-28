-- Identity & Credential Hardening v1
-- Canonical auth.users.id -> mta_profiles.id remains unchanged.
-- No password is stored in public.mta_profiles.

alter table public.mta_profiles
  add column if not exists must_change_password boolean not null default false,
  add column if not exists password_changed_at timestamptz,
  add column if not exists password_reset_at timestamptz,
  add column if not exists password_reset_by uuid;

comment on column public.mta_profiles.must_change_password is
  'Credential lifecycle flag. When true, protected operational API access is blocked until the user completes a password change.';
comment on column public.mta_profiles.password_changed_at is
  'Timestamp of the last successful password change. No credential material is stored.';
comment on column public.mta_profiles.password_reset_at is
  'Timestamp of the last administrative password reset. No credential material is stored.';
comment on column public.mta_profiles.password_reset_by is
  'Auth user id of the OWNER/ADMIN actor that performed the last administrative reset.';

create index if not exists idx_mta_profiles_must_change_password
  on public.mta_profiles(must_change_password)
  where must_change_password = true;
