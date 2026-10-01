create or replace function mta_internal.execute_idempotent_mutation(
  p_idempotency_key text,
  p_request_hash text,
  p_operation text,
  p_table text,
  p_payload jsonb,
  p_where jsonb default '{}'::jsonb,
  p_audit jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security invoker
set search_path = pg_catalog, public, mta_internal
as $$
declare
  v_existing mta_internal.idempotency_keys%rowtype;
  v_result jsonb;
  v_table text;
  v_operation text;
  v_columns text;
  v_insert_columns text;
  v_where_columns text;
  v_sql text;
  v_action text;
  v_resource_type text;
  v_resource_id text;
  v_result_status text;
  v_actor_user_id uuid;
  v_request_id text;
  v_correlation_id text;
begin
  if current_user <> 'service_role' and coalesce(current_setting('request.jwt.claim.role', true), '') <> 'service_role' then
    raise exception 'P9_7_SERVICE_ROLE_REQUIRED';
  end if;

  if p_idempotency_key is null or length(trim(p_idempotency_key)) < 8 then
    raise exception 'P9_7_INVALID_IDEMPOTENCY_KEY';
  end if;

  if p_request_hash is null or p_request_hash !~ '^[0-9a-fA-F]{64}$' then
    raise exception 'P9_7_INVALID_REQUEST_HASH';
  end if;

  v_operation := upper(trim(p_operation));
  v_table := lower(trim(p_table));

  if v_operation not in ('INSERT','UPDATE','DELETE') then
    raise exception 'P9_7_UNSUPPORTED_OPERATION';
  end if;

  if v_table not in ('mta_detainees','mta_placements','mta_movements','mta_leaves','mta_documents','mta_ai_jobs') then
    raise exception 'P9_7_TABLE_NOT_ALLOWED';
  end if;

  if jsonb_typeof(coalesce(p_payload, '{}'::jsonb)) <> 'object'
     or jsonb_typeof(coalesce(p_where, '{}'::jsonb)) <> 'object' then
    raise exception 'P9_7_JSON_OBJECT_REQUIRED';
  end if;

  select * into v_existing
  from mta_internal.idempotency_keys
  where idempotency_key = p_idempotency_key
  for update;

  if found then
    if v_existing.request_hash <> lower(p_request_hash) then
      raise exception 'P9_7_IDEMPOTENCY_CONFLICT';
    end if;
    if v_existing.response = '{}'::jsonb then
      raise exception 'P9_7_INCOMPLETE_IDEMPOTENCY_STATE';
    end if;
    return v_existing.response || jsonb_build_object('replayed', true);
  end if;

  insert into mta_internal.idempotency_keys(idempotency_key, request_hash, status, response)
  values (p_idempotency_key, lower(p_request_hash), 'COMPLETED', '{}'::jsonb)
  on conflict (idempotency_key) do nothing;

  select * into v_existing
  from mta_internal.idempotency_keys
  where idempotency_key = p_idempotency_key
  for update;

  if v_existing.request_hash <> lower(p_request_hash) then
    raise exception 'P9_7_IDEMPOTENCY_CONFLICT';
  end if;

  if v_existing.response <> '{}'::jsonb then
    return v_existing.response || jsonb_build_object('replayed', true);
  end if;

  if v_operation in ('UPDATE','DELETE') and not (p_where ? 'id') then
    raise exception 'P9_7_PRIMARY_KEY_WHERE_REQUIRED';
  end if;

  if v_operation = 'INSERT' then
    select
      string_agg(format('%I', k), ', ' order by k),
      string_agg(format('r.%I', k), ', ' order by k)
      into v_columns, v_insert_columns
    from jsonb_object_keys(p_payload) as k
    join pg_attribute a on a.attrelid = format('public.%I', v_table)::regclass
      and a.attname = k and a.attnum > 0 and not a.attisdropped;

    if v_columns is null then raise exception 'P9_7_EMPTY_INSERT_PAYLOAD'; end if;

    if exists (
      select 1 from jsonb_object_keys(p_payload) k
      left join pg_attribute a on a.attrelid = format('public.%I', v_table)::regclass
        and a.attname = k and a.attnum > 0 and not a.attisdropped
      where a.attname is null
    ) then raise exception 'P9_7_UNKNOWN_INSERT_COLUMN'; end if;

    v_sql := format(
      'insert into public.%I as t (%s)
       select %s from jsonb_populate_record(null::public.%I, $1) as r
       returning to_jsonb(t)',
      v_table, v_columns, v_insert_columns, v_table
    );
    execute v_sql into v_result using p_payload;
    if v_result is null then raise exception 'P9_7_MUTATION_RETURNED_NO_ROW'; end if;

  elsif v_operation = 'UPDATE' then
    if p_payload ? 'id' or p_payload ? 'created_at' then
      raise exception 'P9_7_IMMUTABLE_COLUMN_UPDATE';
    end if;

    select string_agg(format('%I', k), ', ' order by k) into v_columns
    from jsonb_object_keys(p_payload) as k
    join pg_attribute a on a.attrelid = format('public.%I', v_table)::regclass
      and a.attname = k and a.attnum > 0 and not a.attisdropped;

    if v_columns is null then raise exception 'P9_7_EMPTY_UPDATE_PAYLOAD'; end if;

    if exists (
      select 1 from jsonb_object_keys(p_payload) k
      left join pg_attribute a on a.attrelid = format('public.%I', v_table)::regclass
        and a.attname = k and a.attnum > 0 and not a.attisdropped
      where a.attname is null
    ) then raise exception 'P9_7_UNKNOWN_UPDATE_COLUMN'; end if;

    select string_agg(format('t.%1$I = w.%1$I', k), ' and ' order by k) into v_where_columns
    from jsonb_object_keys(p_where) as k
    join pg_attribute a on a.attrelid = format('public.%I', v_table)::regclass
      and a.attname = k and a.attnum > 0 and not a.attisdropped;

    if v_where_columns is null then raise exception 'P9_7_EMPTY_UPDATE_WHERE'; end if;

    if exists (
      select 1 from jsonb_object_keys(p_where) k
      left join pg_attribute a on a.attrelid = format('public.%I', v_table)::regclass
        and a.attname = k and a.attnum > 0 and not a.attisdropped
      where a.attname is null
    ) then raise exception 'P9_7_UNKNOWN_UPDATE_WHERE_COLUMN'; end if;

    v_sql := format(
      'update public.%I as t
       set (%s) = (select %s from jsonb_populate_record(t, $1) as r)
       from jsonb_populate_record(null::public.%I, $2) as w
       where %s
       returning to_jsonb(t)',
      v_table, v_columns, v_columns, v_table, v_where_columns
    );
    execute v_sql into v_result using p_payload, p_where;
    if v_result is null then raise exception 'P9_7_TARGET_NOT_FOUND'; end if;

  else
    select string_agg(format('t.%1$I = w.%1$I', k), ' and ' order by k) into v_where_columns
    from jsonb_object_keys(p_where) as k
    join pg_attribute a on a.attrelid = format('public.%I', v_table)::regclass
      and a.attname = k and a.attnum > 0 and not a.attisdropped;

    if v_where_columns is null then raise exception 'P9_7_EMPTY_DELETE_WHERE'; end if;

    if exists (
      select 1 from jsonb_object_keys(p_where) k
      left join pg_attribute a on a.attrelid = format('public.%I', v_table)::regclass
        and a.attname = k and a.attnum > 0 and not a.attisdropped
      where a.attname is null
    ) then raise exception 'P9_7_UNKNOWN_DELETE_WHERE_COLUMN'; end if;

    v_sql := format(
      'delete from public.%I as t
       using jsonb_populate_record(null::public.%I, $1) as w
       where %s
       returning to_jsonb(t)',
      v_table, v_table, v_where_columns
    );
    execute v_sql into v_result using p_where;
    if v_result is null then raise exception 'P9_7_TARGET_NOT_FOUND'; end if;
  end if;

  v_action := nullif(trim(p_audit->>'action'), '');
  v_resource_type := nullif(trim(p_audit->>'resourceType'), '');
  v_resource_id := nullif(trim(p_audit->>'resourceId'), '');
  v_result_status := coalesce(nullif(trim(p_audit->>'result'), ''), 'SUCCESS');
  v_request_id := nullif(trim(p_audit->>'requestId'), '');
  v_correlation_id := nullif(trim(p_audit->>'correlationId'), '');

  if v_action is null or v_resource_type is null then raise exception 'P9_7_AUDIT_REQUIRED'; end if;
  if v_result_status <> 'SUCCESS' then raise exception 'P9_7_AUDIT_SUCCESS_REQUIRED'; end if;
  if v_resource_id is null then v_resource_id := nullif(v_result->>'id', ''); end if;

  begin
    v_actor_user_id := nullif(trim(p_audit->>'actorUserId'), '')::uuid;
  exception when invalid_text_representation then
    raise exception 'P9_7_INVALID_ACTOR_USER_ID';
  end;

  insert into public.mta_audit_events(
    action, resource_type, resource_id, result, actor_user_id, request_id, correlation_id, occurred_at, metadata
  )
  values (
    v_action, v_resource_type, v_resource_id, v_result_status, v_actor_user_id, v_request_id, v_correlation_id, now(),
    coalesce(p_audit->'metadata', '{}'::jsonb)
      || jsonb_build_object('transactionBoundary','P9.7-DURABLE-v1','idempotencyKey',p_idempotency_key)
  );

  v_result := jsonb_build_object('ok', true, 'replayed', false, 'operation', v_operation, 'table', v_table, 'row', v_result);

  update mta_internal.idempotency_keys
  set response = v_result, status = 'COMPLETED', completed_at = now()
  where idempotency_key = p_idempotency_key;

  return v_result;
end;
$$;

revoke all on function mta_internal.execute_idempotent_mutation(text,text,text,text,jsonb,jsonb,jsonb) from public, anon, authenticated;
grant execute on function mta_internal.execute_idempotent_mutation(text,text,text,text,jsonb,jsonb,jsonb) to service_role;