create or replace function mta_internal.claim_outbox_events(p_limit integer default 25, p_lease_seconds integer default 60)
returns setof mta_internal.outbox_events language sql set search_path=pg_catalog,mta_internal as $$
 update mta_internal.outbox_events set status='PROCESSING',attempts=attempts+1,locked_at=now()
 where event_id in (select event_id from mta_internal.outbox_events where status='PENDING' and available_at<=now() order by occurred_at,event_id for update skip locked limit greatest(1,least(p_limit,100))) returning *; $$;
create or replace function mta_internal.release_outbox_event(p_event_id uuid,p_error text,p_backoff_seconds integer default 60)
returns void language sql set search_path=pg_catalog,mta_internal as $$ update mta_internal.outbox_events set status='PENDING',available_at=now()+make_interval(secs=>greatest(1,least(p_backoff_seconds,86400))),locked_at=null,last_error=left(coalesce(p_error,'OUTBOX_DISPATCH_FAILED'),2000) where event_id=p_event_id and status='PROCESSING'; $$;
create or replace function mta_internal.complete_outbox_event(p_event_id uuid)
returns void language sql set search_path=pg_catalog,mta_internal as $$ update mta_internal.outbox_events set status='PUBLISHED',published_at=now(),locked_at=null,last_error=null where event_id=p_event_id and status='PROCESSING'; $$;
revoke all on function mta_internal.claim_outbox_events(integer,integer) from public,anon,authenticated;
revoke all on function mta_internal.release_outbox_event(uuid,text,integer) from public,anon,authenticated;
revoke all on function mta_internal.complete_outbox_event(uuid) from public,anon,authenticated;
grant execute on function mta_internal.claim_outbox_events(integer,integer) to service_role;
grant execute on function mta_internal.release_outbox_event(uuid,text,integer) to service_role;
grant execute on function mta_internal.complete_outbox_event(uuid) to service_role;
