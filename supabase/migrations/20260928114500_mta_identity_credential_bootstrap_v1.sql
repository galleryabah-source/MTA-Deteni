-- Ensure the canonical Auth -> profile trigger marks newly provisioned
-- accounts as requiring their first credential change.
create or replace function public.mta_bootstrap_profile() returns trigger
language plpgsql security definer set search_path = pg_catalog, public
as $$
begin
  insert into public.mta_profiles(id, display_name, must_change_password)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.email), true)
  on conflict (id) do nothing;
  return new;
end;
$$;
