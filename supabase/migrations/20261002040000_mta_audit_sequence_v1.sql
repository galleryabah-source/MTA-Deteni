begin;

create sequence if not exists public.mta_audit_sequence_seq
  as bigint
  start with 1
  increment by 1
  minvalue 1
  no cycle
  cache 1;

alter table public.mta_audit_events
  add column if not exists audit_sequence bigint;

with ordered as (
  select id,
         row_number() over (order by occurred_at asc, id asc) as seq
  from public.mta_audit_events
)
update public.mta_audit_events a
set audit_sequence=ordered.seq
from ordered
where a.id=ordered.id;

alter table public.mta_audit_events
  alter column audit_sequence set not null;

select setval(
  'public.mta_audit_sequence_seq',
  coalesce((select max(audit_sequence) from public.mta_audit_events),1),
  (select count(*)>0 from public.mta_audit_events)
);

create unique index if not exists mta_audit_events_audit_sequence_uidx
  on public.mta_audit_events(audit_sequence);

create or replace function private.mta_audit_before_insert()
returns trigger
language plpgsql
security definer
set search_path=''
as $$
declare
  v_previous text;
begin
  perform pg_advisory_xact_lock(hashtext('MTA_DETENI_AUDIT_CHAIN_V1'));

  new.audit_sequence := nextval('public.mta_audit_sequence_seq'::regclass);

  select event_hash
    into v_previous
  from public.mta_audit_events
  order by audit_sequence desc
  limit 1;

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
  v_previous text:=null;
  v_expected text;
  v_count bigint:=0;
begin
  for r in
    select *
    from public.mta_audit_events
    order by audit_sequence asc
  loop
    v_count:=v_count+1;

    if r.audit_sequence<>v_count then
      return jsonb_build_object(
        'ok',false,
        'status','INTEGRITY_COMPROMISED',
        'reason','AUDIT_SEQUENCE_GAP_OR_REORDER',
        'checked',v_count,
        'eventId',r.id,
        'auditSequence',r.audit_sequence
      );
    end if;

    if r.hash_version<>'AUDIT-HASH-v1'
       or r.previous_hash is distinct from v_previous then
      return jsonb_build_object(
        'ok',false,
        'status','INTEGRITY_COMPROMISED',
        'reason','AUDIT_HASH_LINK_INVALID',
        'checked',v_count,
        'eventId',r.id,
        'auditSequence',r.audit_sequence
      );
    end if;

    v_expected:=encode(
      extensions.digest(
        private.mta_audit_canonical_material(
          r.id,r.action,r.resource_type,r.resource_id,r.result,
          r.actor_user_id,r.request_id,r.correlation_id,r.occurred_at,
          coalesce(r.metadata,'{}'::jsonb),v_previous
        ),
        'sha256'
      ),
      'hex'
    );

    if r.event_hash is distinct from v_expected then
      return jsonb_build_object(
        'ok',false,
        'status','INTEGRITY_COMPROMISED',
        'reason','AUDIT_HASH_INVALID',
        'checked',v_count,
        'eventId',r.id,
        'auditSequence',r.audit_sequence
      );
    end if;

    v_previous:=r.event_hash;
  end loop;

  return jsonb_build_object(
    'ok',true,
    'status','INTEGRITY_VERIFIED',
    'checked',v_count,
    'lastHash',v_previous
  );
end
$$;

revoke all on function public.mta_verify_audit_integrity() from public,anon,authenticated;
grant execute on function public.mta_verify_audit_integrity() to service_role;

commit;
