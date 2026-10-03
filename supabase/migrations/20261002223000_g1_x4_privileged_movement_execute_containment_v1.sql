-- MTA DETENI G1-X4: contain privileged movement transaction execution.
-- Canonical caller is the service-role mta-api boundary.
-- The movement function is SECURITY DEFINER and must not be directly executable
-- by authenticated/anon callers because actor identity is supplied as a parameter.

revoke execute on function mta_internal.execute_movement_transaction(
  text,text,uuid,uuid,uuid,text,text,text,text,timestamptz
) from public, anon, authenticated;

grant execute on function mta_internal.execute_movement_transaction(
  text,text,uuid,uuid,uuid,text,text,text,text,timestamptz
) to service_role;
