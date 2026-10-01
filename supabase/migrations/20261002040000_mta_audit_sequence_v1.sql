begin;

create sequence if not exists public.mta_audit_sequence_seq
  as bigint
  start with 1
  increment by 1
  minvalue 1
  no cycle
  cache 1;

create table if not exists public.mta_audit_chain_epochs (
  epoch_id bigint primary key,
  status text not null check (status in ('ACTIVE','CLOSED')),
  created_at timestamptz not null default now(),
  historical_anchor_digest text not null,
  genesis_hash text not null,
  historical_event_count bigint not null
);

alter table public.mta_audit_events
  add column if not exists audit_epoch bigint,
  add column if not exists audit_sequence bigint;

insert into public.mta_audit_chain_epochs(
  epoch_id,status,historical_anchor_digest,genesis_hash,historical_event_count
)
select
  1,
  'ACTIVE',
  encode(extensions.digest(
    convert_to(
      coalesce(
        (select string_agg(
          id::text||':'||coalesce(event_hash,'')||':'||occurred_at::text,
          '|' order by id
        ) from public.mta_audit_events),
        ''
      ),
      'UTF8'
    ),
    'sha256'
  ), 'hex'),
  encode(extensions.digest(
    convert_to(
      coalesce(
        (select string_agg(
          id::text||':'||coalesce(event_hash,'')||':'||occurred_at::text,
          '|' order by id
        ) from public.mta_audit_events),
        ''
      ),
      'UTF8'
    ),
    'sha256'
  ), 'hex'),
  (select count(*) from public.mta_audit_events)
from (select 1) seed
where not exists(select 1 from public.mta_audit_chain_epochs where epoch_id=1);

create unique index if not exists mta_audit_events_epoch_sequence_uidx
  on public.mta_audit_events(audit_epoch,audit_sequence)
  where audit_epoch is not null and audit_sequence is not null;

create or replace function private.mta_audit_before_insert()
returns trigger
language plpgsql
security definer
set search_path=''
as $$
declare
  v_epoch bigint;
  v_genesis text;
  v_previous text;
begin
  perform pg_advisory_xact_lock(hashtext('MTA_DETENI_AUDIT_CHAIN_V2'));

  select epoch_id,genesis_hash
    into v_epoch,v_genesis
  from public.mta_audit_chain_epochs
  where status='ACTIVE'
  order by epoch_id desc
  limit 1
  for update;

  if v_epoch is null then
    raise exception 'AUDIT_CHAIN_EPOCH_NOT_INITIALIZED';
  end if;

  new.audit_epoch := v_epoch;
  new.audit_sequence := nextval('public.mta_audit_sequence_seq'::regclass);

  select event_hash
    into v_previous
  from public.mta_audit_events
  where audit_epoch=v_epoch
  order by audit_sequence desc
  limit 1;

  v_previous:=coalesce(v_previous,v_genesis);

  new.hash_version:='AUDIT-HASH-v1';
  new.previous_hash:=v_previous;
  new.event_hash:=encode(
    extensions.digest(
      private.mta_audit_canonical_material(
        new.id,new.action,new.resource_type,new.resource_id,new.result,
        new.actor_user_id,new.request_id,new.correlation_id,new.occurred_at,
        coalesce(new.metadata,'{}'::jsonb),v_previous
      ),
      'sha256'
    ),
    'hex'
  );

  return new;
end
$$;

drop trigger if exists mta_audit_before_insert_hash on public.mta_audit_events;
create trigger mta_audit_before_insert_hash
before insert on public.mta_audit_events
for each row
execute function private.mta_audit_before_insert();

create or replace function public.mta_verify_audit_integrity()
returns jsonb
language plpgsql
security definer
set search_path=''
as $$
declare
  r record;
  v_previous text;
  v_expected text;
  v_count bigint:=0;
  v_legacy_count bigint:=0;
  v_branch_count bigint:=0;
  v_epoch bigint;
  v_genesis text;
begin
  select epoch_id,genesis_hash into v_epoch,v_genesis
  from public.mta_audit_chain_epochs
  where status='ACTIVE'
  order by epoch_id desc limit 1;

  if v_epoch is null then
    return jsonb_build_object('ok',false,'status','INTEGRITY_COMPROMISED','reason','AUDIT_CHAIN_EPOCH_NOT_INITIALIZED');
  end if;

  for r in
    select * from public.mta_audit_events
    where audit_sequence is null
    order by occurred_at asc,id asc
  loop
    v_legacy_count:=v_legacy_count+1;
    v_expected:=encode(extensions.digest(
      private.mta_audit_canonical_material(
        r.id,r.action,r.resource_type,r.resource_id,r.result,
        r.actor_user_id,r.request_id,r.correlation_id,r.occurred_at,
        coalesce(r.metadata,'{}'::jsonb),r.previous_hash
      ),'sha256'),'hex');
    if r.event_hash is distinct from v_expected then
      return jsonb_build_object('ok',false,'status','INTEGRITY_COMPROMISED','reason','HISTORICAL_EVENT_HASH_INVALID','eventId',r.id);
    end if;
  end loop;

  select count(*) into v_branch_count
  from (
    select previous_hash from public.mta_audit_events
    where audit_sequence is null and previous_hash is not null
    group by previous_hash having count(*)>1
  ) b;

  v_previous:=v_genesis;
  v_count:=0;
  for r in
    select * from public.mta_audit_events
    where audit_epoch=v_epoch and audit_sequence is not null
    order by audit_sequence asc
  loop
    v_count:=v_count+1;
    if r.audit_sequence<>v_count then
      return jsonb_build_object('ok',false,'status','INTEGRITY_COMPROMISED','reason','AUDIT_SEQUENCE_GAP_OR_REORDER','auditSequence',r.audit_sequence,'eventId',r.id);
    end if;
    if r.previous_hash is distinct from v_previous then
      return jsonb_build_object('ok',false,'status','INTEGRITY_COMPROMISED','reason','AUDIT_HASH_LINK_INVALID','auditSequence',r.audit_sequence,'eventId',r.id);
    end if;
    v_expected:=encode(extensions.digest(
      private.mta_audit_canonical_material(
        r.id,r.action,r.resource_type,r.resource_id,r.result,
        r.actor_user_id,r.request_id,r.correlation_id,r.occurred_at,
        coalesce(r.metadata,'{}'::jsonb),v_previous
      ),'sha256'),'hex');
    if r.event_hash is distinct from v_expected then
      return jsonb_build_object('ok',false,'status','INTEGRITY_COMPROMISED','reason','AUDIT_HASH_INVALID','auditSequence',r.audit_sequence,'eventId',r.id);
    end if;
    v_previous:=r.event_hash;
  end loop;

  return jsonb_build_object(
    'ok',true,
    'status','INTEGRITY_VERIFIED_WITH_HISTORICAL_EVIDENCE_BOUNDARY',
    'historicalEvents',v_legacy_count,
    'historicalBranchPoints',v_branch_count,
    'activeEpoch',v_epoch,
    'activeEpochEvents',v_count,
    'genesisHash',v_genesis,
    'lastHash',case when v_count=0 then v_genesis else v_previous end
  );
end
$$;

revoke all on function public.mta_verify_audit_integrity() from public,anon,authenticated;
grant execute on function public.mta_verify_audit_integrity() to service_role;

commit;
