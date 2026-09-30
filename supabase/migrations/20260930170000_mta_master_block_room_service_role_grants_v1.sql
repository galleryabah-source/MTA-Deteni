-- MTA DETENI: restore the existing canonical P9.7 mutation boundary's
-- required table privileges for production Master Block/Room writes.
-- Repository migration only. Production execution remains governed.
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.mta_blocks TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.mta_rooms TO service_role;
