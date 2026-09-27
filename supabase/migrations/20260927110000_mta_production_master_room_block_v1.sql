-- Local replay compatibility: production already has mta_scopes; disposable CI replay must create the dependency when absent.
create table if not exists public.mta_scopes (id uuid primary key default gen_random_uuid(), code text not null unique, name text not null, active boolean not null default true, created_at timestamptz not null default now(), updated_at timestamptz not null default now());

-- MTA DETENI Production Foundation v1
-- Controlled exception to Migration Freeze: canonical Master Block/Room dependency.
-- Synthetic data only: no seed rows are inserted.

create table if not exists public.mta_blocks (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  status text not null default 'ACTIVE' check (status in ('ACTIVE','INACTIVE')),
  scope_id uuid not null references public.mta_scopes(id),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.mta_rooms (
  id uuid primary key default gen_random_uuid(),
  block_id uuid not null references public.mta_blocks(id),
  code text not null unique,
  name text not null,
  capacity integer not null check (capacity > 0),
  status text not null default 'ACTIVE' check (status in ('ACTIVE','INACTIVE')),
  type text not null default 'STANDARD',
  gender text not null default 'UMUM',
  scope_id uuid not null references public.mta_scopes(id),
  version integer not null default 1 check (version > 0),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(block_id,name)
);

alter table public.mta_placements
  add column if not exists block_id uuid references public.mta_blocks(id),
  add column if not exists room_id uuid references public.mta_rooms(id),
  add column if not exists movement_id uuid references public.mta_movements(id),
  add column if not exists correlation_id text,
  add column if not exists request_key text;

create index if not exists mta_blocks_scope_idx on public.mta_blocks(scope_id);
create index if not exists mta_rooms_block_idx on public.mta_rooms(block_id);
create index if not exists mta_rooms_scope_idx on public.mta_rooms(scope_id);
create index if not exists mta_placements_room_idx on public.mta_placements(room_id);
create index if not exists mta_placements_movement_idx on public.mta_placements(movement_id);
create unique index if not exists mta_placements_request_key_uidx on public.mta_placements(request_key) where request_key is not null;

alter table public.mta_blocks enable row level security;
alter table public.mta_rooms enable row level security;

drop policy if exists mta_blocks_select_scope on public.mta_blocks;
create policy mta_blocks_select_authenticated on public.mta_blocks for select using (auth.uid() is not null);

drop policy if exists mta_blocks_write_scope on public.mta_blocks;
create policy mta_blocks_write_scope on public.mta_blocks for all using (
  private.mta_current_role() = any(array['OWNER','ADMIN'])
) with check (
  private.mta_current_role() = any(array['OWNER','ADMIN'])
);

drop policy if exists mta_rooms_select_scope on public.mta_rooms;
create policy mta_rooms_select_authenticated on public.mta_rooms for select using (auth.uid() is not null);

drop policy if exists mta_rooms_write_scope on public.mta_rooms;
create policy mta_rooms_write_scope on public.mta_rooms for all using (
  private.mta_current_role() = any(array['OWNER','ADMIN'])
) with check (
  private.mta_current_role() = any(array['OWNER','ADMIN'])
);

comment on table public.mta_blocks is 'MTA DETENI canonical production Master Block; no synthetic seed data.';
comment on table public.mta_rooms is 'MTA DETENI canonical production Master Room; placement depends on this registry.';

grant select on public.mta_blocks, public.mta_rooms to authenticated;
