create or replace function mta_internal.execute_movement_transaction(p_idempotency_key text,p_request_hash text,p_detainee_id uuid,p_target_room_id uuid,p_actor_user_id uuid,p_request_id text,p_correlation_id text,p_movement_type text default 'TRANSFER',p_purpose text default null,p_occurred_at timestamptz default now()) returns jsonb language plpgsql security definer set search_path to pg_catalog,public,mta_internal as $$
declare e mta_internal.idempotency_keys%rowtype; a mta_profiles%rowtype; d mta_detainees%rowtype; r mta_rooms%rowtype; cur mta_placements%rowtype; occ int; cap int; mid uuid:=gen_random_uuid(); pid uuid:=gen_random_uuid(); aid uuid; oid uuid:=gen_random_uuid(); out jsonb;
begin
 if p_idempotency_key is null or length(trim(p_idempotency_key))<8 then raise exception 'P11_INVALID_IDEMPOTENCY_KEY'; end if;
 if p_request_hash is null or p_request_hash !~ '^[0-9a-fA-F]{64}$' then raise exception 'P11_INVALID_REQUEST_HASH'; end if;
 if p_detainee_id is null or p_target_room_id is null or p_actor_user_id is null then raise exception 'P11_REQUIRED_IDENTIFIERS'; end if;
 if p_request_id is null or p_correlation_id is null then raise exception 'P11_CONTEXT_REQUIRED'; end if;
 select * into e from mta_internal.idempotency_keys where idempotency_key=p_idempotency_key for update;
 if found then
   if e.request_hash<>lower(p_request_hash) then raise exception 'P11_IDEMPOTENCY_CONFLICT'; end if;
   if e.response='{}'::jsonb then raise exception 'P11_INCOMPLETE_IDEMPOTENCY_STATE'; end if;
   return e.response||jsonb_build_object('replayed',true);
 end if;
 insert into mta_internal.idempotency_keys(idempotency_key,request_hash,status,response) values(p_idempotency_key,lower(p_request_hash),'PROCESSING','{}'::jsonb);
 select * into a from public.mta_profiles where id=p_actor_user_id and active=true for update;
 if not found or a.role not in ('OWNER','ADMIN','EDITOR') then raise exception 'P11_RBAC_WRITE_DENIED'; end if;
 select * into d from public.mta_detainees where id=p_detainee_id for update;
 if not found then raise exception 'P11_DETAINEE_NOT_FOUND'; end if;
 if upper(coalesce(d.status,''))<>'AKTIF' then raise exception 'P11_DETAINEE_NOT_ACTIVE'; end if;
 if a.role not in ('OWNER','ADMIN') and not exists(select 1 from public.mta_profile_scopes ps where ps.profile_id=p_actor_user_id and ps.scope_id=d.scope_id and ps.active=true) then raise exception 'P11_DETAINEE_SCOPE_DENIED'; end if;
 select * into r from public.mta_rooms where id=p_target_room_id for update;
 if not found then raise exception 'P11_ROOM_NOT_FOUND'; end if;
 if r.status<>'ACTIVE' then raise exception 'P11_ROOM_NOT_ACTIVE'; end if;
 if r.scope_id<>d.scope_id then raise exception 'P11_ROOM_SCOPE_MISMATCH'; end if;
 select * into cur from public.mta_placements where detainee_id=p_detainee_id and until is null order by since desc,created_at desc limit 1 for update;
 if found and cur.room_id=p_target_room_id then raise exception 'P11_SAME_ROOM'; end if;
 select count(*)::int into occ from public.mta_placements p join public.mta_detainees x on x.id=p.detainee_id where p.room_id=p_target_room_id and p.until is null and upper(coalesce(x.status,''))='AKTIF';
 cap:=r.capacity;
 if occ>=cap then raise exception 'P11_ROOM_CAPACITY_EXCEEDED'; end if;
 if found then update public.mta_placements set until=coalesce(p_occurred_at,now()) where id=cur.id; end if;
 insert into public.mta_movements(id,detainee_id,movement_type,destination,purpose,occurred_at,metadata) values(mid,p_detainee_id,upper(coalesce(p_movement_type,'TRANSFER')),r.code,p_purpose,coalesce(p_occurred_at,now()),jsonb_build_object('transactionBoundary','P11-MOVEMENT-v1','targetRoomId',p_target_room_id,'targetBlockId',r.block_id,'correlationId',p_correlation_id,'requestId',p_request_id,'idempotencyKey',p_idempotency_key));
 insert into public.mta_placements(id,detainee_id,block,room,since,metadata,block_id,room_id,movement_id,correlation_id,request_key) values(pid,p_detainee_id,null,r.name,coalesce(p_occurred_at,now()),jsonb_build_object('source','P11_TRANSACTIONAL_MOVEMENT','correlationId',p_correlation_id),r.block_id,r.id,mid,p_correlation_id,p_idempotency_key);
 update public.mta_detainees set placement=r.name,updated_at=now() where id=p_detainee_id;
 insert into public.mta_audit_events(action,resource_type,resource_id,result,actor_user_id,request_id,correlation_id,occurred_at,metadata) values('MOVEMENT_TRANSFER_COMMITTED','MOVEMENT',mid::text,'SUCCESS',p_actor_user_id,p_request_id,p_correlation_id,coalesce(p_occurred_at,now()),jsonb_build_object('transactionBoundary','P11-MOVEMENT-v1','detaineeId',p_detainee_id,'fromPlacementId',case when cur.id is null then null else cur.id::text end,'placementId',pid,'roomId',p_target_room_id,'blockId',r.block_id,'idempotencyKey',p_idempotency_key)) returning id into aid;
 insert into mta_internal.outbox_events(event_id,event_type,aggregate_type,aggregate_id,payload,idempotency_key,occurred_at) values(oid,'MOVEMENT_TRANSFER_COMMITTED','MOVEMENT',mid::text,jsonb_build_object('eventId',oid,'auditEventId',aid,'detaineeId',p_detainee_id,'movementId',mid,'placementId',pid,'roomId',p_target_room_id,'blockId',r.block_id,'requestId',p_request_id,'correlationId',p_correlation_id,'actorUserId',p_actor_user_id,'idempotencyKey',p_idempotency_key),p_idempotency_key,coalesce(p_occurred_at,now()));
 out:=jsonb_build_object('ok',true,'replayed',false,'command','MOVE_DETAINEE','movementId',mid,'placementId',pid,'auditEventId',aid,'outboxEventId',oid,'detaineeId',p_detainee_id,'targetRoomId',p_target_room_id,'targetBlockId',r.block_id,'occupiedBefore',occ,'capacity',cap,'correlationId',p_correlation_id,'requestId',p_request_id);
 update mta_internal.idempotency_keys set response=out,status='COMPLETED',completed_at=now() where idempotency_key=p_idempotency_key;
 return out;
end; $$;

create or replace function public.mta_execute_movement_transaction(p_idempotency_key text,p_request_hash text,p_detainee_id uuid,p_target_room_id uuid,p_actor_user_id uuid,p_request_id text,p_correlation_id text,p_movement_type text default 'TRANSFER',p_purpose text default null,p_occurred_at timestamptz default now()) returns jsonb language plpgsql security definer set search_path to pg_catalog,public,mta_internal as $$
begin return mta_internal.execute_movement_transaction(p_idempotency_key,p_request_hash,p_detainee_id,p_target_room_id,p_actor_user_id,p_request_id,p_correlation_id,p_movement_type,p_purpose,p_occurred_at); end; $$;
revoke all on function public.mta_execute_movement_transaction(text,text,uuid,uuid,uuid,text,text,text,text,timestamptz) from public;
grant execute on function public.mta_execute_movement_transaction(text,text,uuid,uuid,uuid,text,text,text,text,timestamptz) to service_role;