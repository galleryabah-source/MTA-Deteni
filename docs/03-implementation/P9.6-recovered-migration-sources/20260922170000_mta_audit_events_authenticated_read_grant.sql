-- MTA DETENI: authenticated audit read grant.
-- RLS remains the authorization boundary; only OWNER/ADMIN/AUDITOR can see rows.
grant select on public.mta_audit_events to authenticated;
