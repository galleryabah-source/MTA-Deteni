undefined

revoke all on function mta_internal.execute_idempotent_mutation(text,text,text,text,jsonb,jsonb,jsonb) from public, anon, authenticated;
grant execute on function mta_internal.execute_idempotent_mutation(text,text,text,text,jsonb,jsonb,jsonb) to service_role;
