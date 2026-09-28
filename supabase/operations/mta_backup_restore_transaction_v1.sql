-- Controlled DB operation artifact for server-side MTA DETENI backup restore.
-- NOT applied automatically. Migration Freeze remains in force.
-- Apply only after explicit database/governance clearance.
--
-- The Edge Function calls this function with service_role credentials.
-- It is intentionally not executable by anon/authenticated.
--
-- Restore is one PostgreSQL transaction: any failure rolls back the entire restore.
-- Audit triggers remain enabled; the operation appends a RESTORE audit event.

create or replace function public.mta_restore_backup_transaction(
  p_backup_id text,
  p_request_hash text,
  p_payload jsonb,
  p_actor_user_id uuid,
  p_request_id text,
  p_correlation_id text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  existing_restore jsonb;
  inserted_counts jsonb;
begin
  if coalesce(trim(p_backup_id),'') = '' then
    raise exception 'BACKUP_RESTORE_BACKUP_ID_REQUIRED';
  end if;

  if coalesce(trim(p_request_hash),'') = '' then
    raise exception 'BACKUP_RESTORE_REQUEST_HASH_REQUIRED';
  end if;

  if jsonb_typeof(p_payload) <> 'object' then
    raise exception 'BACKUP_RESTORE_PAYLOAD_INVALID';
  end if;

  if not (p_payload ?& array[
    'detainees','blocks','rooms','movements','placements','leaves','documents','audit'
  ]) then
    raise exception 'BACKUP_RESTORE_ROOT_INVALID';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(p_request_hash, 0));

  select jsonb_build_object(
    'replayed', true,
    'backupId', resource_id,
    'correlationId', correlation_id
  )
  into existing_restore
  from public.mta_audit_events
  where action = 'BACKUP_RESTORE'
    and resource_type = 'BACKUP'
    and resource_id = p_backup_id
    and result = 'SUCCESS'
  order by occurred_at desc
  limit 1;

  if existing_restore is not null then
    return existing_restore;
  end if;

  if jsonb_array_length(p_payload->'detainees') > 100000
     or jsonb_array_length(p_payload->'blocks') > 10000
     or jsonb_array_length(p_payload->'rooms') > 100000
     or jsonb_array_length(p_payload->'movements') > 500000
     or jsonb_array_length(p_payload->'placements') > 500000
     or jsonb_array_length(p_payload->'leaves') > 500000
     or jsonb_array_length(p_payload->'documents') > 100000
     or jsonb_array_length(p_payload->'audit') > 1000000 then
    raise exception 'BACKUP_RESTORE_CARDINALITY_EXCEEDED';
  end if;

  -- Delete dependent rows first. All statements are in this transaction.
  delete from public.mta_placements;
  delete from public.mta_movements;
  delete from public.mta_leaves;
  delete from public.mta_documents where revision_of is not null;
  delete from public.mta_documents;
  delete from public.mta_rooms;
  delete from public.mta_blocks;
  delete from public.mta_detainees;
  delete from public.mta_audit_events;

  -- Restore parent/domain rows in FK order.
  insert into public.mta_detainees
  select * from jsonb_populate_recordset(
    null::public.mta_detainees,
    p_payload->'detainees'
  );

  insert into public.mta_blocks
  select * from jsonb_populate_recordset(
    null::public.mta_blocks,
    p_payload->'blocks'
  );

  insert into public.mta_rooms
  select * from jsonb_populate_recordset(
    null::public.mta_rooms,
    p_payload->'rooms'
  );

  insert into public.mta_movements
  select * from jsonb_populate_recordset(
    null::public.mta_movements,
    p_payload->'movements'
  );

  insert into public.mta_placements
  select * from jsonb_populate_recordset(
    null::public.mta_placements,
    p_payload->'placements'
  );

  insert into public.mta_leaves
  select * from jsonb_populate_recordset(
    null::public.mta_leaves,
    p_payload->'leaves'
  );

  -- Parent documents must exist before revision rows.
  insert into public.mta_documents
  select * from jsonb_populate_recordset(
    null::public.mta_documents,
    (
      select coalesce(
        jsonb_agg(value order by coalesce((value->>'revision')::integer,1), value->>'created_at'),
        '[]'::jsonb
      )
      from jsonb_array_elements(p_payload->'documents') as e(value)
    )
  );

  insert into public.mta_audit_events
  select * from jsonb_populate_recordset(
    null::public.mta_audit_events,
    p_payload->'audit'
  );

  insert into public.mta_audit_events(
    action, resource_type, resource_id, result,
    actor_user_id, request_id, correlation_id, metadata
  )
  values (
    'BACKUP_RESTORE',
    'BACKUP',
    p_backup_id,
    'SUCCESS',
    p_actor_user_id,
    p_request_id,
    p_correlation_id,
    jsonb_build_object(
      'requestHash', p_request_hash,
      'restoredCounts', jsonb_build_object(
        'detainees', jsonb_array_length(p_payload->'detainees'),
        'blocks', jsonb_array_length(p_payload->'blocks'),
        'rooms', jsonb_array_length(p_payload->'rooms'),
        'movements', jsonb_array_length(p_payload->'movements'),
        'placements', jsonb_array_length(p_payload->'placements'),
        'leaves', jsonb_array_length(p_payload->'leaves'),
        'documents', jsonb_array_length(p_payload->'documents'),
        'audit', jsonb_array_length(p_payload->'audit')
      )
    )
  );

  inserted_counts := jsonb_build_object(
    'detainees', jsonb_array_length(p_payload->'detainees'),
    'blocks', jsonb_array_length(p_payload->'blocks'),
    'rooms', jsonb_array_length(p_payload->'rooms'),
    'movements', jsonb_array_length(p_payload->'movements'),
    'placements', jsonb_array_length(p_payload->'placements'),
    'leaves', jsonb_array_length(p_payload->'leaves'),
    'documents', jsonb_array_length(p_payload->'documents'),
    'audit', jsonb_array_length(p_payload->'audit')
  );

  return jsonb_build_object(
    'replayed', false,
    'backupId', p_backup_id,
    'correlationId', p_correlation_id,
    'restoredCounts', inserted_counts
  );
exception
  when others then
    raise;
end;
$$;

revoke execute on function public.mta_restore_backup_transaction(text,text,jsonb,uuid,text,text)
  from public, anon, authenticated;

grant execute on function public.mta_restore_backup_transaction(text,text,jsonb,uuid,text,text)
  to service_role;
