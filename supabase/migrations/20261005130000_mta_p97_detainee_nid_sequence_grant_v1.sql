-- MTA DETENI: restore service_role privilege for the canonical detainee NID sequence.
-- Required by the canonical NID trigger executed during P9.7 detainee mutation.
--
-- No schema or generator change. This only restores the sequence privileges
-- required by service_role to execute nextval() in the canonical NID trigger.

grant usage, select
on sequence public.mta_detainee_nid_seq
to service_role;
