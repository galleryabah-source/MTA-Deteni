-- NIP Identity Contract v1
-- NIP is the human-facing login identifier. Passwords remain in Supabase Auth.
-- Existing auth.users identities are intentionally preserved; the login edge
-- function resolves NIP -> auth user server-side, so changing the UI does not
-- require rewriting existing auth email identities.

alter table public.mta_profiles
  add column if not exists nip text;

alter table public.mta_profiles
  drop constraint if exists mta_profiles_nip_format;

alter table public.mta_profiles
  add constraint mta_profiles_nip_format
  check (nip is null or nip ~ '^[0-9]{18}$');

create unique index if not exists uq_mta_profiles_nip
  on public.mta_profiles(nip)
  where nip is not null;

comment on column public.mta_profiles.nip is
  'Canonical 18-digit employee identifier used as the MTA DETENI login identifier. Password material remains exclusively in Supabase Auth.';

