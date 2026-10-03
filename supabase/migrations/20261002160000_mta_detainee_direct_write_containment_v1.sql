-- MTA DETENI: contain direct detainee DML behind the canonical service boundary.
-- Repository migration only. Production execution remains governed by the G1 gate.
--
-- GET/read access remains available to authenticated users under existing RLS.
-- INSERT/UPDATE/DELETE must flow through the canonical mta-api service boundary.
revoke insert, update, delete on table public.mta_detainees from authenticated;
