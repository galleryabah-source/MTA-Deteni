-- MTA DETENI authenticated API grants
-- These grants expose only the RLS-protected domain tables to the authenticated API role.
-- Authorization remains enforced by the canonical scope/RBAC policies.

grant select, insert, update, delete on table
  public.mta_detainees,
  public.mta_placements,
  public.mta_movements,
  public.mta_leaves,
  public.mta_documents
to authenticated;
