-- Disposable PostgreSQL integration gate for QR detainee notes.
-- LOCAL/NONPROD ONLY. Entire fixture set is rolled back.
\set ON_ERROR_STOP on
begin;
set local request.jwt.claim.role = 'service_role';

do $$
declare
  v_owner uuid := '00000000-0000-4000-8000-000000000101';
  v_admin uuid := '00000000-0000-4000-8000-000000000102';
  v_editor uuid := '00000000-0000-4000-8000-000000000103';
  v_health uuid := '00000000-0000-4000-8000-000000000104';
  v_viewer uuid := '00000000-0000-4000-8000-000000000105';
  v_scope uuid;
  v_other_scope uuid;
  v_detainee uuid;
  v_other_detainee uuid;
  v_result jsonb;
  v_replay jsonb;
  v_count integer;
  v_error text;
  v_key text;
  v_hash text := repeat('a',64);
begin
  insert into auth.users(id,email) values
    (v_owner,'owner.notes.test@example.invalid'),
    (v_admin,'admin.notes.test@example.invalid'),
    (v_editor,'editor.notes.test@example.invalid'),
    (v_health,'healthcare.notes.test@example.invalid'),
    (v_viewer,'viewer.notes.test@example.invalid')
  on conflict (id) do nothing;

  insert into public.mta_profiles(id,role,display_name,active) values
    (v_owner,'OWNER','Synthetic OWNER',true),
    (v_admin,'ADMIN','Synthetic ADMIN',true),
    (v_editor,'EDITOR','Synthetic EDITOR',true),
    (v_health,'HEALTHCARE','Synthetic HEALTHCARE',true),
    (v_viewer,'VIEWER','Synthetic VIEWER',true)
  on conflict (id) do update set role=excluded.role,active=true,display_name=excluded.display_name;

  insert into public.mta_scopes(code,name,active)
  values ('NONPROD-NOTES-A-'||txid_current(),'Synthetic notes scope A',true)
  returning id into v_scope;
  insert into public.mta_scopes(code,name,active)
  values ('NONPROD-NOTES-B-'||txid_current(),'Synthetic notes scope B',true)
  returning id into v_other_scope;

  insert into public.mta_profile_scopes(profile_id,scope_id,active) values
    (v_editor,v_scope,true),(v_health,v_scope,true),(v_viewer,v_scope,true);

  insert into public.mta_detainees(code,name,status,scope_id,entry_year)
  values ('NONPROD-NOTES-'||txid_current(),'Synthetic detainee A','AKTIF',v_scope,2026)
  returning id into v_detainee;
  insert into public.mta_detainees(code,name,status,scope_id,entry_year)
  values ('NONPROD-NOTES-B-'||txid_current(),'Synthetic detainee B','AKTIF',v_other_scope,2026)
  returning id into v_other_detainee;

  -- HEALTHCARE scoped write commits note + audit + outbox + idempotency response.
  v_key := 'notes-health-'||txid_current();
  v_result := public.mta_create_detainee_note_transaction(
    v_key,v_hash,'HEALTH',v_detainee,null,'Synthetic integration finding','OBSERVATION',
    'Synthetic action','Synthetic follow-up',now(),v_health,'req-notes-health-test','corr-notes-health-test');
  if coalesce((v_result->>'ok')::boolean,false) is not true or coalesce((v_result->>'replayed')::boolean,true) is not false then
    raise exception 'DNOTE_TEST_HEALTH_COMMIT_RESPONSE_INVALID';
  end if;
  if not exists(select 1 from public.mta_detainee_health_records where id=(v_result#>>'{row,id}')::uuid and detainee_id=v_detainee) then
    raise exception 'DNOTE_TEST_HEALTH_ROW_MISSING';
  end if;
  if not exists(select 1 from public.mta_audit_events where id=(v_result->>'auditEventId')::uuid and action='DETAINEE_HEALTH_RECORD_CREATE') then
    raise exception 'DNOTE_TEST_AUDIT_ROW_MISSING';
  end if;
  if not exists(select 1 from mta_internal.outbox_events where event_id=(v_result->>'outboxEventId')::uuid and idempotency_key=v_key) then
    raise exception 'DNOTE_TEST_OUTBOX_ROW_MISSING';
  end if;
  if not exists(select 1 from mta_internal.idempotency_keys where idempotency_key=v_key and request_hash=v_hash and response<>'{}'::jsonb) then
    raise exception 'DNOTE_TEST_IDEMPOTENCY_RESPONSE_MISSING';
  end if;

  -- An unauthorized actor must not retrieve an existing idempotent response.
  begin
    perform public.mta_create_detainee_note_transaction(
      v_key,v_hash,'HEALTH',v_detainee,null,'Synthetic integration finding','OBSERVATION',
      'Synthetic action','Synthetic follow-up',now(),v_viewer,'req-notes-replay-deny','corr-notes-replay-deny');
    raise exception 'DNOTE_TEST_UNAUTHORIZED_REPLAY_NOT_REJECTED';
  exception when others then
    get stacked diagnostics v_error = message_text;
    if v_error not like '%DNOTE_HEALTHCARE_ROLE_REQUIRED%' then raise; end if;
  end;

  v_replay := public.mta_create_detainee_note_transaction(
    v_key,v_hash,'HEALTH',v_detainee,null,'Synthetic integration finding','OBSERVATION',
    'Synthetic action','Synthetic follow-up',now(),v_health,'req-notes-health-test','corr-notes-health-test');
  if coalesce((v_replay->>'replayed')::boolean,false) is not true then raise exception 'DNOTE_TEST_REPLAY_NOT_DETECTED'; end if;
  select count(*) into v_count from public.mta_detainee_health_records where detainee_id=v_detainee;
  if v_count<>1 then raise exception 'DNOTE_TEST_REPLAY_DUPLICATED_NOTE'; end if;
  select count(*) into v_count from mta_internal.outbox_events where idempotency_key=v_key;
  if v_count<>1 then raise exception 'DNOTE_TEST_REPLAY_DUPLICATED_OUTBOX'; end if;

  -- Read-back from the canonical health table must return the committed record.
  select count(*) into v_count
  from public.mta_detainee_health_records
  where detainee_id=v_detainee and examiner_user_id=v_health
    and findings='Synthetic integration finding';
  if v_count<>1 then raise exception 'DNOTE_TEST_HEALTH_READBACK_MISSING'; end if;

  -- OWNER bypasses scope membership but remains attributable in audit/outbox.
  v_key := 'notes-owner-'||txid_current();
  v_result := public.mta_create_detainee_note_transaction(
    v_key,repeat('1',64),'ACTIVITY',v_other_detainee,'ACTIVITY','Synthetic OWNER note',
    null,'','',now(),v_owner,'req-notes-owner-test','corr-notes-owner-test');
  if coalesce((v_result->>'ok')::boolean,false) is not true then
    raise exception 'DNOTE_TEST_OWNER_WRITE_FAILED';
  end if;
  if not exists(select 1 from public.mta_detainee_activity_notes
    where id=(v_result#>>'{row,id}')::uuid and actor_user_id=v_owner
      and detainee_id=v_other_detainee) then
    raise exception 'DNOTE_TEST_OWNER_SCOPE_BYPASS_OR_READBACK_FAILED';
  end if;

  -- ADMIN also bypasses scope membership for a health record.
  v_key := 'notes-admin-'||txid_current();
  v_result := public.mta_create_detainee_note_transaction(
    v_key,repeat('2',64),'HEALTH',v_other_detainee,null,'Synthetic ADMIN finding',
    'OBSERVATION','Synthetic action','Synthetic follow-up',now(),v_admin,
    'req-notes-admin-test','corr-notes-admin-test');
  if coalesce((v_result->>'ok')::boolean,false) is not true then
    raise exception 'DNOTE_TEST_ADMIN_WRITE_FAILED';
  end if;
  if not exists(select 1 from public.mta_detainee_health_records
    where id=(v_result#>>'{row,id}')::uuid and examiner_user_id=v_admin
      and detainee_id=v_other_detainee) then
    raise exception 'DNOTE_TEST_ADMIN_SCOPE_BYPASS_OR_READBACK_FAILED';
  end if;


  -- EDITOR with an active matching scope can create an activity note.
  v_key := 'notes-activity-'||txid_current();
  v_result := public.mta_create_detainee_note_transaction(
    v_key,repeat('f',64),'ACTIVITY',v_detainee,'INCIDENT','Synthetic activity note',
    null,'','',now(),v_editor,'req-notes-activity-test','corr-notes-activity-test');
  if coalesce((v_result->>'ok')::boolean,false) is not true
     or coalesce((v_result->>'noteKind'),'') <> 'ACTIVITY' then
    raise exception 'DNOTE_TEST_ACTIVITY_COMMIT_RESPONSE_INVALID';
  end if;
  if not exists(select 1 from public.mta_detainee_activity_notes where id=(v_result#>>'{row,id}')::uuid and detainee_id=v_detainee and actor_user_id=v_editor) then
    raise exception 'DNOTE_TEST_ACTIVITY_ROW_MISSING';
  end if;
  if not exists(select 1 from public.mta_audit_events where id=(v_result->>'auditEventId')::uuid and action='DETAINEE_ACTIVITY_NOTE_CREATE') then
    raise exception 'DNOTE_TEST_ACTIVITY_AUDIT_MISSING';
  end if;
  if not exists(select 1 from mta_internal.outbox_events where event_id=(v_result->>'outboxEventId')::uuid and idempotency_key=v_key) then
    raise exception 'DNOTE_TEST_ACTIVITY_OUTBOX_MISSING';
  end if;

  -- Reusing a key with a different request hash must fail closed.
  begin
    perform public.mta_create_detainee_note_transaction(
      v_key,repeat('b',64),'HEALTH',v_detainee,null,'Synthetic changed finding','OBSERVATION',
      '','',now(),v_health,'req-conflict','corr-conflict');
    raise exception 'DNOTE_TEST_IDEMPOTENCY_CONFLICT_NOT_REJECTED';
  exception when others then
    get stacked diagnostics v_error = message_text;
    if v_error not like '%DNOTE_IDEMPOTENCY_CONFLICT%' then raise; end if;
  end;

  -- EDITOR and HEALTHCARE must not cross scope boundaries.
  begin
    perform public.mta_create_detainee_note_transaction(
      'notes-scope-deny-'||txid_current(),repeat('c',64),'HEALTH',v_other_detainee,null,
      'Synthetic denied finding','OBSERVATION','','',now(),v_editor,'req-scope-deny','corr-scope-deny');
    raise exception 'DNOTE_TEST_SCOPE_DENIAL_NOT_REJECTED';
  exception when others then
    get stacked diagnostics v_error = message_text;
    if v_error not like '%DNOTE_SCOPE_DENIED%' then raise; end if;
  end;

  -- VIEWER is denied even when assigned to the detainee scope.
  begin
    perform public.mta_create_detainee_note_transaction(
      'notes-role-deny-'||txid_current(),repeat('d',64),'HEALTH',v_detainee,null,
      'Synthetic denied finding','OBSERVATION','','',now(),v_viewer,'req-role-deny','corr-role-deny');
    raise exception 'DNOTE_TEST_ROLE_DENIAL_NOT_REJECTED';
  exception when others then
    get stacked diagnostics v_error = message_text;
    if v_error not like '%DNOTE_HEALTHCARE_ROLE_REQUIRED%' then raise; end if;
  end;

  -- Failure after note/audit inserts must roll the entire unit of work back.
  create function pg_temp.dnote_fail_outbox() returns trigger language plpgsql as $trigger$
  begin
    if new.idempotency_key like 'notes-rollback-%' then raise exception 'DNOTE_TEST_FORCED_OUTBOX_FAILURE'; end if;
    return new;
  end
  $trigger$;
  create trigger dnote_fail_outbox before insert on mta_internal.outbox_events
  for each row execute function pg_temp.dnote_fail_outbox();

  v_key := 'notes-rollback-'||txid_current();
  begin
    perform public.mta_create_detainee_note_transaction(
      v_key,repeat('e',64),'HEALTH',v_detainee,null,'Synthetic rollback finding','OBSERVATION',
      'Synthetic action','Synthetic follow-up',now(),v_health,'req-rollback','corr-rollback');
    raise exception 'DNOTE_TEST_ROLLBACK_FAILURE_NOT_TRIGGERED';
  exception when others then
    get stacked diagnostics v_error = message_text;
    if v_error not like '%DNOTE_TEST_FORCED_OUTBOX_FAILURE%' then raise; end if;
  end;
  drop trigger dnote_fail_outbox on mta_internal.outbox_events;
  drop function pg_temp.dnote_fail_outbox();

  if exists(select 1 from public.mta_detainee_health_records where request_id='req-rollback') then raise exception 'DNOTE_TEST_ROLLBACK_LEFT_NOTE'; end if;
  if exists(select 1 from public.mta_audit_events where request_id='req-rollback') then raise exception 'DNOTE_TEST_ROLLBACK_LEFT_AUDIT'; end if;
  if exists(select 1 from mta_internal.outbox_events where idempotency_key=v_key) then raise exception 'DNOTE_TEST_ROLLBACK_LEFT_OUTBOX'; end if;
  if exists(select 1 from mta_internal.idempotency_keys where idempotency_key=v_key) then raise exception 'DNOTE_TEST_ROLLBACK_LEFT_IDEMPOTENCY'; end if;

  -- RLS and privileges: no direct client access; service_role has server-only access.
  if not (select relrowsecurity from pg_class where oid='public.mta_detainee_health_records'::regclass) then raise exception 'DNOTE_TEST_HEALTH_RLS_DISABLED'; end if;
  if not (select relrowsecurity from pg_class where oid='public.mta_detainee_activity_notes'::regclass) then raise exception 'DNOTE_TEST_ACTIVITY_RLS_DISABLED'; end if;
  if not (select relrowsecurity from pg_class where oid='public.mta_audit_chain_epochs'::regclass) then raise exception 'DNOTE_TEST_AUDIT_EPOCH_RLS_DISABLED'; end if;
  if (select relforcerowsecurity from pg_class where oid='public.mta_audit_chain_epochs'::regclass) then raise exception 'DNOTE_TEST_AUDIT_EPOCH_FORCE_RLS_UNEXPECTED'; end if;
  if has_table_privilege('anon','public.mta_detainee_health_records','SELECT')
     or has_table_privilege('authenticated','public.mta_detainee_health_records','SELECT')
     or has_table_privilege('anon','public.mta_detainee_health_records','INSERT')
     or has_table_privilege('authenticated','public.mta_detainee_health_records','INSERT')
     or has_table_privilege('anon','public.mta_detainee_activity_notes','SELECT')
     or has_table_privilege('authenticated','public.mta_detainee_activity_notes','SELECT')
     or has_table_privilege('anon','public.mta_detainee_activity_notes','INSERT')
     or has_table_privilege('authenticated','public.mta_detainee_activity_notes','INSERT') then
    raise exception 'DNOTE_TEST_DIRECT_CLIENT_PRIVILEGE_PRESENT';
  end if;
  if not has_function_privilege('service_role','public.mta_create_detainee_note_transaction(text,text,text,uuid,text,text,text,text,text,timestamptz,uuid,text,text)','EXECUTE') then
    raise exception 'DNOTE_TEST_SERVICE_RPC_GRANT_MISSING';
  end if;
  if has_function_privilege('anon','public.mta_create_detainee_note_transaction(text,text,text,uuid,text,text,text,text,text,timestamptz,uuid,text,text)','EXECUTE')
     or has_function_privilege('authenticated','public.mta_create_detainee_note_transaction(text,text,text,uuid,text,text,text,text,text,timestamptz,uuid,text,text)','EXECUTE') then
    raise exception 'DNOTE_TEST_CLIENT_RPC_GRANT_PRESENT';
  end if;

  -- The audit-chain trigger must be SECURITY DEFINER and retain an owner path
  -- to the epoch table after client/service_role grants are revoked.
  if not exists (
    select 1
    from pg_trigger t
    join pg_class c on c.oid=t.tgrelid
    join pg_proc p on p.oid=t.tgfoid
    where not t.tgisinternal
      and t.tgname='mta_audit_before_insert_hash'
      and c.oid='public.mta_audit_events'::regclass
      and p.oid='private.mta_audit_before_insert()'::regprocedure
      and p.prosecdef
      and has_table_privilege(pg_get_userbyid(p.proowner),'public.mta_audit_chain_epochs','SELECT')
  ) then
    raise exception 'DNOTE_TEST_AUDIT_TRIGGER_OWNER_PATH_INVALID';
  end if;
  if has_table_privilege('service_role','public.mta_audit_chain_epochs','SELECT')
     or has_table_privilege('anon','public.mta_audit_chain_epochs','SELECT')
     or has_table_privilege('authenticated','public.mta_audit_chain_epochs','SELECT') then
    raise exception 'DNOTE_TEST_AUDIT_EPOCH_DIRECT_ACCESS_PRESENT';
  end if;
end $;

rollback;

select 'DNOTE_POSTGRES_TRANSACTION_RLS_INTEGRATION_PASS' as result;
