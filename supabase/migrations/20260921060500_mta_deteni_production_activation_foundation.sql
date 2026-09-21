-- MTA DETENI production activation foundation
-- Applied to Supabase project tmmhxqgzelgrsrxbbfzh on 2026-09-21.
-- Additive only; all application tables are RLS-enabled and deny-by-default.

create extension if not exists pgcrypto with schema extensions;

create table if not exists public.mta_detainees (
  id uuid primary key default gen_random_uuid(), code text not null unique, name text not null,
  nationality text, status text not null default 'AKTIF', placement text,
  source text not null default 'PRODUCTION_RUNTIME', created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(), metadata jsonb not null default '{}'::jsonb
);
create table if not exists public.mta_placements (
  id uuid primary key default gen_random_uuid(), detainee_id uuid not null references public.mta_detainees(id) on delete restrict,
  block text, room text, since timestamptz not null default now(), until timestamptz,
  metadata jsonb not null default '{}'::jsonb, created_at timestamptz not null default now()
);
create table if not exists public.mta_movements (
  id uuid primary key default gen_random_uuid(), detainee_id uuid references public.mta_detainees(id) on delete restrict,
  movement_type text not null, destination text, purpose text, occurred_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb, created_at timestamptz not null default now()
);
create table if not exists public.mta_leaves (
  id uuid primary key default gen_random_uuid(), detainee_id uuid references public.mta_detainees(id) on delete restrict,
  destination text, purpose text, start_at timestamptz, status text not null default 'DRAFT',
  metadata jsonb not null default '{}'::jsonb, created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.mta_documents (
  id uuid primary key default gen_random_uuid(), document_id text not null unique, document_type text not null,
  report_date date, regu_id text, shift_id text, status text not null default 'DRAFT',
  revision integer not null default 1 check (revision > 0), revision_of uuid references public.mta_documents(id) on delete restrict,
  template_version text, integrity_hash text, filename text, payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(), validated_at timestamptz, generated_at timestamptz,
  review_started_at timestamptz, approved_at timestamptz, finalized_at timestamptz,
  created_by uuid, updated_at timestamptz not null default now()
);
create table if not exists public.mta_audit_events (
  id uuid primary key default gen_random_uuid(), action text not null, resource_type text not null,
  resource_id text, result text not null, actor_user_id uuid, request_id text, correlation_id text,
  occurred_at timestamptz not null default now(), metadata jsonb not null default '{}'::jsonb
);
create table if not exists public.mta_storage_objects (
  id uuid primary key default gen_random_uuid(), bucket_id text not null, object_path text not null,
  document_id uuid references public.mta_documents(id) on delete set null, content_type text,
  content_size bigint, sha256 text, classification text not null default 'PRIVATE',
  created_at timestamptz not null default now(), unique(bucket_id, object_path)
);
create table if not exists public.mta_ai_jobs (
  id uuid primary key default gen_random_uuid(), job_type text not null, status text not null default 'QUEUED',
  provider text, model text, input_ref text, output jsonb, error_code text,
  created_at timestamptz not null default now(), completed_at timestamptz
);

create index if not exists mta_detainees_status_idx on public.mta_detainees(status);
create index if not exists mta_placements_detainee_idx on public.mta_placements(detainee_id);
create index if not exists mta_movements_detainee_time_idx on public.mta_movements(detainee_id, occurred_at desc);
create index if not exists mta_leaves_detainee_status_idx on public.mta_leaves(detainee_id, status);
create index if not exists mta_documents_retrieval_idx on public.mta_documents(report_date, regu_id, shift_id, revision desc);
create index if not exists mta_documents_revision_idx on public.mta_documents(revision_of);
create index if not exists mta_audit_resource_idx on public.mta_audit_events(resource_type, resource_id, occurred_at desc);
create index if not exists mta_storage_document_idx on public.mta_storage_objects(document_id);

alter table public.mta_detainees enable row level security;
alter table public.mta_placements enable row level security;
alter table public.mta_movements enable row level security;
alter table public.mta_leaves enable row level security;
alter table public.mta_documents enable row level security;
alter table public.mta_audit_events enable row level security;
alter table public.mta_storage_objects enable row level security;
alter table public.mta_ai_jobs enable row level security;

revoke all on public.mta_detainees, public.mta_placements, public.mta_movements, public.mta_leaves,
  public.mta_documents, public.mta_audit_events, public.mta_storage_objects, public.mta_ai_jobs
from anon, authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('mta-deteni-private','mta-deteni-private',false,10485760,
  array['image/jpeg','image/png','image/webp','application/pdf'])
on conflict (id) do update set public=false, file_size_limit=10485760,
  allowed_mime_types=array['image/jpeg','image/png','image/webp','application/pdf'];
