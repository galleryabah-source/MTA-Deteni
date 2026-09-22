create schema if not exists mta_internal;

create table if not exists mta_internal.outbox_events (
  event_id uuid primary key default gen_random_uuid(),
  event_type text not null,
  aggregate_type text not null,
  aggregate_id text,
  payload jsonb not null default '{}'::jsonb,
  idempotency_key text not null,
  occurred_at timestamptz not null default now(),
  status text not null default 'PENDING' check (status in ('PENDING','PROCESSING','PUBLISHED','FAILED')),
  attempts integer not null default 0 check (attempts >= 0),
  available_at timestamptz not null default now(),
  locked_at timestamptz,
  published_at timestamptz,
  last_error text,
  created_at timestamptz not null default now(),
  constraint mta_outbox_idempotency_key_uk unique (idempotency_key)
);

create index if not exists mta_outbox_pending_idx on mta_internal.outbox_events(status, available_at, occurred_at);
create index if not exists mta_outbox_aggregate_idx on mta_internal.outbox_events(aggregate_type, aggregate_id, occurred_at);
alter table mta_internal.outbox_events enable row level security;
revoke all on mta_internal.outbox_events from public, anon, authenticated;
grant select, insert, update, delete on mta_internal.outbox_events to service_role;
