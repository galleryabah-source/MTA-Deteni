create or replace function public.mta_execute_idempotent_mutation(
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
begin
  return mta_internal.execute_idempotent_mutation(
    p_idempotency_key,
    p_request_hash,
    p_operation,
    p_table,
    p_payload,
    p_where,
    p_audit
  );
end;
$$;

revoke all on function public.mta_execute_idempotent_mutation(text,text,text,text,jsonb,jsonb,jsonb) from public, anon, authenticated;
grant execute on function public.mta_execute_idempotent_mutation(text,text,text,text,jsonb,jsonb,jsonb) to service_role;