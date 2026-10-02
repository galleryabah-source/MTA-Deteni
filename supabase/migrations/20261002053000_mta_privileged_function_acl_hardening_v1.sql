-- P14.1 privileged function ACL hardening
-- Remove unnecessary direct EXECUTE grants from non-public trigger/internal helpers.
-- Keep mta_current_role() executable by authenticated because RLS policies use it.
-- Canonical public movement wrapper remains service_role-only.

revoke execute on function mta_internal.execute_movement_transaction(
  text,text,uuid,uuid,uuid,text,text,text,text,timestamptz
) from public, anon, authenticated, service_role;

revoke execute on function private.mta_audit_before_insert() from public, anon, authenticated, service_role;
revoke execute on function private.mta_audit_immutable() from public, anon, authenticated, service_role;
revoke execute on function private.mta_audit_canonical_material(
  uuid,text,text,text,text,uuid,text,text,timestamptz,jsonb,text
) from public, anon, authenticated, service_role;

-- mta_current_role() intentionally remains executable by authenticated RLS policies.
