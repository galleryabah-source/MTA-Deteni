drop schema if exists nid_cert cascade;
create schema nid_cert;

create sequence nid_cert.mta_detainee_nid_seq as bigint minvalue 1 start with 1 cache 1 no cycle;

create table nid_cert.mta_detainees(
  id bigserial primary key,
  entry_year smallint not null check(entry_year between 2000 and 2099),
  nid text not null unique check(nid ~ '^RDM-PTK-[0-9]{2}-[0-9]{6}$')
);

create or replace function nid_cert.mta_assign_canonical_nid()
returns trigger
language plpgsql
as $$
declare v_sequence bigint;
begin
  if new.nid is not null then
    raise exception 'NID_SYSTEM_GENERATED';
  end if;
  if new.entry_year is null then
    raise exception 'ENTRY_YEAR_REQUIRED';
  end if;
  v_sequence := nextval('nid_cert.mta_detainee_nid_seq');
  if v_sequence > 999999 then
    raise exception 'NID_SEQUENCE_EXHAUSTED';
  end if;
  new.nid := 'RDM-PTK-' || lpad((new.entry_year % 100)::text,2,'0') || '-' || lpad(v_sequence::text,6,'0');
  return new;
end;
$$;

create trigger mta_detainees_canonical_nid_trg
before insert on nid_cert.mta_detainees
for each row execute function nid_cert.mta_assign_canonical_nid();
