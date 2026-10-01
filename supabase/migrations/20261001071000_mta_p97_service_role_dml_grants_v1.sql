-- MTA DETENI: restore explicit service_role DML grants for canonical P9.7 mutations.
-- Repository migration only. Production deployment remains a governed action.
--
-- The generic mutation RPC executes under service_role and therefore still
-- requires explicit table privileges even though service_role bypasses RLS.
-- These grants restore the server-side mutation contract without exposing
-- writes to anon/authenticated.

grant select, insert, update, delete on table
  public.mta_detainees,
  public.mta_placements,
  public.mta_movements,
  public.mta_leaves,
  public.mta_documents
to service_role;
