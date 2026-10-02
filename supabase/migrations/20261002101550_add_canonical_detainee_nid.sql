-- Canonical Detainee NID v1
-- Existing production Deteni entered in 2026.
-- Legacy code 01..13 is preserved and used only as the initial sequence mapping.

alter table public.mta_detainees
  add column entry_year smallint,
  add column nid text;

update public.mta_detainees
set
  entry_year = 2026,
  nid = 'RDM-PTK-26-' || lpad(code, 6, '0')
where code ~ '^[0-9]{1,6}$';

do $$
declare
  v_count integer;
begin
  select count(*) into v_count
  from public.mta_detainees
  where entry_year is null or nid is null;

  if v_count <> 0 then
    raise exception 'NID migration aborted: % detainee rows lack entry_year or nid', v_count;
  end if;
end $$;

alter table public.mta_detainees
  alter column entry_year set not null,
  alter column nid set not null;

alter table public.mta_detainees
  add constraint mta_detainees_entry_year_check
    check (entry_year between 2000 and 2099),
  add constraint mta_detainees_nid_format_check
    check (nid ~ '^RDM-PTK-[0-9]{2}-[0-9]{6}$'),
  add constraint mta_detainees_nid_key unique (nid);

create sequence public.mta_detainee_nid_seq
  as bigint
  minvalue 1
  start with 14;

select setval('public.mta_detainee_nid_seq', 13, true);

create or replace function public.mta_assign_canonical_nid()
returns trigger
language plpgsql
as $$
declare
  v_sequence bigint;
begin
  if tg_op = 'INSERT' then
    if new.nid is not null then
      raise exception 'NID_SYSTEM_GENERATED: nid must not be supplied by caller';
    end if;

    if new.entry_year is null then
      raise exception 'ENTRY_YEAR_REQUIRED: entry_year is required for NID generation';
    end if;

    v_sequence := nextval('public.mta_detainee_nid_seq');

    if v_sequence > 999999 then
      raise exception 'NID_SEQUENCE_EXHAUSTED: six-digit NID sequence exhausted';
    end if;

    new.nid :=
      'RDM-PTK-' ||
      lpad((new.entry_year % 100)::text, 2, '0') ||
      '-' ||
      lpad(v_sequence::text, 6, '0');

    return new;
  end if;

  if tg_op = 'UPDATE' then
    if new.nid is distinct from old.nid then
      raise exception 'NID_IMMUTABLE: canonical NID cannot be changed';
    end if;

    if new.entry_year is distinct from old.entry_year then
      raise exception 'ENTRY_YEAR_IMMUTABLE: entry_year cannot be changed after NID issuance';
    end if;

    return new;
  end if;

  return new;
end;
$$;

drop trigger if exists mta_detainees_canonical_nid_trg
  on public.mta_detainees;

create trigger mta_detainees_canonical_nid_trg
before insert or update of nid, entry_year
on public.mta_detainees
for each row
execute function public.mta_assign_canonical_nid();

comment on column public.mta_detainees.nid is
  'Canonical operational detainee identity. System-generated and immutable. Format RDM-PTK-YY-NNNNNN.';

comment on column public.mta_detainees.entry_year is
  'Authoritative year of detainee entry used to derive the YY component of NID.';
