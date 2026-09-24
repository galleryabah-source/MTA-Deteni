import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type OutboxEvent = { event_id:string; event_type:string; aggregate_type:string; aggregate_id:string|null; payload:Record<string,unknown>; idempotency_key:string; occurred_at:string; status:"PROCESSING"; attempts:number; };

const json=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:{"Content-Type":"application/json","Cache-Control":"no-store"}});
const adminClient=()=>{const url=Deno.env.get("SUPABASE_URL"),key=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");if(!url||!key)throw new Error("DISPATCHER_CONFIGURATION_ERROR");return createClient(url,key,{auth:{autoRefreshToken:false,persistSession:false}});};

const validatePayload=(event:OutboxEvent)=>{
  const required=["eventId","auditEventId","operation","table","row","requestId","correlationId","actorUserId","idempotencyKey"];
  for(const field of required) if(!(field in event.payload)) throw new Error("OUTBOX_PAYLOAD_INVALID:"+field);
  if(event.payload.eventId!==event.event_id) throw new Error("OUTBOX_EVENT_ID_MISMATCH");
  if(event.payload.idempotencyKey!==event.idempotency_key) throw new Error("OUTBOX_IDEMPOTENCY_MISMATCH");
};

const publishInternal=async(event:OutboxEvent)=>{
  validatePayload(event);
  return {accepted:true,delivery:"INTERNAL_APPLICATION_DISPATCH",eventId:event.event_id};
};

Deno.serve(async(req)=>{
  if(req.method!=="POST")return json({ok:false,error:"METHOD_NOT_ALLOWED"},405);
  const admin=adminClient();
  const body=await req.json().catch(()=>({}));
  const limit=Math.max(1,Math.min(25,Number(body?.limit||10)));
  const leaseSeconds=Math.max(15,Math.min(300,Number(body?.lease_seconds||60)));
  const {data:events,error:claimError}=await admin.rpc("claim_outbox_events",{p_limit:limit,p_lease_seconds:leaseSeconds});
  if(claimError)return json({ok:false,error:"OUTBOX_CLAIM_FAILED"},500);
  const results=[];
  for(const event of (events||[]) as OutboxEvent[]){
    try{
      const delivery=await publishInternal(event);
      const {error}=await admin.rpc("complete_outbox_event",{p_event_id:event.event_id});
      if(error)throw new Error("OUTBOX_COMPLETE_FAILED");
      results.push({eventId:event.event_id,status:"PUBLISHED",attempts:event.attempts,delivery});
    }catch(error){
      const message=String(error instanceof Error?error.message:error).slice(0,500);
      const {error:releaseError}=await admin.rpc("release_outbox_event",{p_event_id:event.event_id,p_error:message,p_backoff_seconds:Math.min(900,Math.max(30,event.attempts*60))});
      results.push({eventId:event.event_id,status:releaseError?"FAILED_RELEASE":"RETRY_PENDING",attempts:event.attempts,error:message});
    }
  }
  return json({ok:true,claimed:(events||[]).length,published:results.filter(r=>r.status==="PUBLISHED").length,retryPending:results.filter(r=>r.status==="RETRY_PENDING").length,results});
});