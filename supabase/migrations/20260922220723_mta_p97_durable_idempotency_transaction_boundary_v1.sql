create schema if not exists mta_internal;

create table if not exists mta_internal.idempotency_keys (
  idempotency_key text primary key,
  request_hash text not null,
  status text not null check (status = 'COMPLETED'),
  response jsonb not null,
  created_at timestamptz not null default now(),
  completed_at timestamptz not null default now()
);

create index if not exists mta_idempotency_keys_completed_at_idx
  on mta_internal.idempotency_keys (completed_at);

alter table mta_internal.idempotency_keys enable row level security;
revoke all on mta_internal.idempotency_keys from anon, authenticated;
grant usage on schema mta_internal to service_role;
grant select, insert, update, delete on mta_internal.idempotency_keys to service_role;