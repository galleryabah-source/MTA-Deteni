-- MTA DETENI: durable detainee activity notes and restricted healthcare records.
-- Additive migration. No existing detainee records are rewritten.
begin;

alter table public.mta_profiles drop constraint if exists mta_profiles_role_check;
alter table public.mta_profiles
  add constraint mta_profiles_role_check
  check (role in ('OWNER','ADMIN','EDITOR','REVIEWER','AUDITOR','VIEWER','HEALTHCARE'));

create table if not exists public.mta_detainee_activity_notes (
  id uuid primary key default gen_random_uuid(),
  scope_id uuid not null references public.mta_scopes(id) on delete restrict,
  detainee_id uuid not null references public.mta_detainees(id) on delete restrict,
  note_type text not null check (note_type in ('ACTIVITY','CONDITION','INCIDENT')),
  content text not null check (length(trim(content)) between 1 and 4000),
  occurred_at timestamptz not null default now(),
  actor_user_id uuid not null references public.mta_profiles(id) on delete restrict,
  request_id text not null,
  correlation_id text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.mta_detainee_health_records (
  id uuid primary key default gen_random_uuid(),
  scope_id uuid not null references public.mta_scopes(id) on delete restrict,
  detainee_id uuid not null references public.mta_detainees(id) on delete restrict,
  exam_type text not null check (exam_type in ('OBSERVATION','EXAMINATION','FOLLOW_UP','REFERRAL')),
  findings text not null check (length(trim(findings)) between 1 and 4000),
  action_taken text not null default '' check (length(action_taken) <= 3000),
  follow_up text not null default '' check (length(follow_up) <= 2000),
  examined_at timestamptz not null default now(),
  examiner_user_id uuid not null references public.mta_profiles(id) on delete restrict,
  created_by uuid not null references public.mta_profiles(id) on delete restrict,
  request_id text not null,
  correlation_id text not null,
  created_at timestamptz not null default now()
);

create index if not exists mta_activity_notes_detainee_created_idx
  on public.mta_detainee_activity_notes(detainee_id, created_at desc);
create index if not exists mta_health_records_detainee_examined_idx
  on public.mta_detainee_health_records(detainee_id, examined_at desc);

alter table public.mta_detainee_activity_notes enable row level security;
alter table public.mta_detainee_health_records enable row level security;
revoke all on public.mta_detainee_activity_notes from anon, authenticated;
revoke all on public.mta_detainee_health_records from anon, authenticated;
grant select, insert on public.mta_detainee_activity_notes to service_role;
grant select, insert on public.mta_detainee_health_records to service_role;

create or replace function public.mta_create_detainee_note_transaction(
  p_idempotency_key text,
  p_request_hash text,
  p_note_kind text,
  p_detainee_id uuid,
  p_note_type text,
  p_content text,
  p_exam_type text,
  p_action_taken text,
  p_follow_up text,
  p_examined_at timestamptz,
  p_actor_user_id uuid,
  p_request_id text,
  p_correlation_id text
) returns jsonb
language plpgsql security definer
set search_path to pg_catalog, public, mta_internal
as $$
declare
  v_existing mta_internal.idempotency_keys%rowtype;
  v_profile public.mta_profiles%rowtype;
  v_detainee public.mta_detainees%rowtype;
  v_scope_id uuid;
  v_record jsonb;
  v_record_id uuid;
  v_audit_id uuid;
  v_event_id uuid := gen_random_uuid();
  v_action text;
  v_resource_type text;
  v_now timestamptz := now();
  v_response jsonb;
begin
  if current_user <> 'service_role' and coalesce(current_setting('request.jwt.claim.role', true), '') <> 'service_role' then
    raise exception 'DNOTE_SERVICE_ROLE_REQUIRED';
  end if;
  if p_idempotency_key is null or length(trim(p_idempotency_key)) < 8 then raise exception 'DNOTE_IDEMPOTENCY_KEY_REQUIRED'; end if;
  if p_request_hash is null or p_request_hash !~ '^[0-9a-fA-F]{64}$' then raise exception 'DNOTE_REQUEST_HASH_INVALID'; end if;
  if p_actor_user_id is null or p_detainee_id is null or p_request_id is null or p_correlation_id is null then raise exception 'DNOTE_CONTEXT_REQUIRED'; end if;
  if p_note_kind not in ('ACTIVITY','HEALTH') then raise exception 'DNOTE_KIND_INVALID'; end if;

  select * into v_existing from mta_internal.idempotency_keys where idempotency_key=p_idempotency_key for update;
  if found then
    if v_existing.request_hash <> lower(p_request_hash) then raise exception 'DNOTE_IDEMPOTENCY_CONFLICT'; end if;
    if v_existing.response = '{}'::jsonb then raise exception 'DNOTE_IDEMPOTENCY_INCOMPLETE'; end if;
    return v_existing.response || jsonb_build_object('replayed',true);
  end if;
  insert into mta_internal.idempotency_keys(idempotency_key,request_hash,status,response)
    values(p_idempotency_key,lower(p_request_hash),'COMPLETED','{}'::jsonb)
    on conflict(idempotency_key) do nothing;
  select * into v_existing from mta_internal.idempotency_keys where idempotency_key=p_idempotency_key for update;
  if v_existing.request_hash <> lower(p_request_hash) then raise exception 'DNOTE_IDEMPOTENCY_CONFLICT'; end if;
  if v_existing.response <> '{}'::jsonb then return v_existing.response || jsonb_build_object('replayed',true); end if;

  select * into v_profile from public.mta_profiles where id=p_actor_user_id and active=true for update;
  if not found then raise exception 'DNOTE_ACTOR_INACTIVE'; end if;
  if p_note_kind='HEALTH' and v_profile.role not in ('OWNER','ADMIN','HEALTHCARE') then raise exception 'DNOTE_HEALTHCARE_ROLE_REQUIRED'; end if;
  if p_note_kind='ACTIVITY' and v_profile.role not in ('OWNER','ADMIN','EDITOR','HEALTHCARE') then raise exception 'DNOTE_ACTIVITY_ROLE_REQUIRED'; end if;

  select * into v_detainee from public.mta_detainees where id=p_detainee_id for update;
  if not found then raise exception 'DNOTE_DETAINEE_NOT_FOUND'; end if;
  if v_profile.role not in ('OWNER','ADMIN') and not exists (
    select 1 from public.mta_profile_scopes ps where ps.profile_id=p_actor_user_id and ps.scope_id=v_detainee.scope_id and ps.active=true
  ) then raise exception 'DNOTE_SCOPE_DENIED'; end if;
  v_scope_id := v_detainee.scope_id;

  if p_note_kind='ACTIVITY' then
    if p_note_type not in ('ACTIVITY','CONDITION','INCIDENT') or length(trim(coalesce(p_content,''))) not between 1 and 4000 then raise exception 'DNOTE_ACTIVITY_INPUT_INVALID'; end if;
    insert into public.mta_detainee_activity_notes(scope_id,detainee_id,note_type,content,occurred_at,actor_user_id,request_id,correlation_id)
    values(v_scope_id,p_detainee_id,p_note_type,trim(p_content),coalesce(p_examined_at,v_now),p_actor_user_id,p_request_id,p_correlation_id)
    returning id,to_jsonb(public.mta_detainee_activity_notes.*) into v_record_id,v_record;
    v_action := 'DETAINEE_ACTIVITY_NOTE_CREATE'; v_resource_type := 'DETAINEE_ACTIVITY_NOTE';
  else
    if p_exam_type not in ('OBSERVATION','EXAMINATION','FOLLOW_UP','REFERRAL') or length(trim(coalesce(p_content,''))) not between 1 and 4000 then raise exception 'DNOTE_HEALTH_INPUT_INVALID'; end if;
    insert into public.mta_detainee_health_records(scope_id,detainee_id,exam_type,findings,action_taken,follow_up,examined_at,examiner_user_id,created_by,request_id,correlation_id)
    values(v_scope_id,p_detainee_id,p_exam_type,trim(p_content),left(coalesce(p_action_taken,''),3000),left(coalesce(p_follow_up,''),2000),coalesce(p_examined_at,v_now),p_actor_user_id,p_actor_user_id,p_request_id,p_correlation_id)
    returning id,to_jsonb(public.mta_detainee_health_records.*) into v_record_id,v_record;
    v_action := 'DETAINEE_HEALTH_RECORD_CREATE'; v_resource_type := 'DETAINEE_HEALTH_RECORD';
  end if;

  insert into public.mta_audit_events(action,resource_type,resource_id,result,actor_user_id,request_id,correlation_id,occurred_at,metadata)
  values(v_action,v_resource_type,v_record_id::text,'SUCCESS',p_actor_user_id,p_request_id,p_correlation_id,v_now,
    jsonb_build_object('detaineeId',p_detainee_id,'scopeId',v_scope_id,'noteKind',p_note_kind,'idempotencyKey',p_idempotency_key))
  returning id into v_audit_id;

  insert into mta_internal.outbox_events(event_id,event_type,aggregate_type,aggregate_id,payload,idempotency_key,occurred_at)
  values(v_event_id,v_action,v_resource_type,v_record_id::text,
    jsonb_build_object('eventId',v_event_id,'auditEventId',v_audit_id,'detaineeId',p_detainee_id,'scopeId',v_scope_id,'actorUserId',p_actor_user_id,'requestId',p_request_id,'correlationId',p_correlation_id,'idempotencyKey',p_idempotency_key),
    p_idempotency_key,v_now);

  v_response := jsonb_build_object('ok',true,'replayed',false,'noteKind',p_note_kind,'row',v_record,'auditEventId',v_audit_id,'outboxEventId',v_event_id,'requestId',p_request_id,'correlationId',p_correlation_id);
  update mta_internal.idempotency_keys set response=v_response,status='COMPLETED',completed_at=v_now where idempotency_key=p_idempotency_key;
  return v_response;
end;
$$;

revoke all on function public.mta_create_detainee_note_transaction(text,text,text,uuid,text,text,text,text,text,timestamptz,uuid,text,text) from public, anon, authenticated;
grant execute on function public.mta_create_detainee_note_transaction(text,text,text,uuid,text,text,text,text,text,timestamptz,uuid,text,text) to service_role;

commit;
