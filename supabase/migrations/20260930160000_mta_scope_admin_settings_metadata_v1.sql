-- Restore the canonical admin-settings persistence contract on mta_scopes.
-- The production API persists adminSettings in scope metadata; the original
-- canonical scope migration did not provision that column.

alter table public.mta_scopes
  add column if not exists metadata jsonb not null default '{}'::jsonb;

grant select, update on table public.mta_scopes to service_role;
