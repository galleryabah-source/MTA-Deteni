-- Close direct table access to audit-chain epoch metadata.
-- The chain-maintenance trigger is SECURITY DEFINER and owned by postgres;
-- this migration does not FORCE RLS, so its owner path remains available.
-- No client policy is intentionally created: this table is internal metadata.
begin;

alter table public.mta_audit_chain_epochs enable row level security;
alter table public.mta_audit_chain_epochs no force row level security;

-- Revoke inherited PUBLIC privileges explicitly as well as named API roles.
revoke all on table public.mta_audit_chain_epochs from public, anon, authenticated, service_role;

commit;
