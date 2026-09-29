-- P9.6 schema reconciliation: complete the contract consumed by
-- admin-config. This is intentionally schema-only; no scope or profile
-- assignment data is provisioned here.

alter table public.mta_scopes
  add column if not exists metadata jsonb not null default '{}'::jsonb;

comment on column public.mta_scopes.metadata is
  'Canonical scope metadata. adminSettings is stored under metadata.adminSettings by the privileged admin-config resource.';
