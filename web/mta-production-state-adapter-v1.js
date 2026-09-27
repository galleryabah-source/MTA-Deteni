(()=>{
  'use strict';
  const API='https://tmmhxqgzelgrsrxbbfzh.supabase.co/functions/v1/mta-api';
  // Production is explicit. Staging/preview workers remain synthetic unless deliberately promoted.
  const PRODUCTION_HOSTS=new Set(['mta-deteni.galleryabah.workers.dev']);
  const isProduction=()=>PRODUCTION_HOSTS.has(location.hostname);
  const state=()=>window.__mtaProductionState||null;
  const session=async()=>{const r=await window.mtaAuth?.session?.();return r?.data?.session||null};
  async function request(resource,{method='GET',body,headers={}}={}){
    const s=await session();
    if(!s?.access_token)throw new Error('PRODUCTION_AUTH_REQUIRED');
    const res=await fetch(API+'/'+encodeURIComponent(resource),{method,headers:{Authorization:'Bearer '+s.access_token,Accept:'application/json',...(body!==undefined?{'Content-Type':'application/json'}:{}),...headers},body:body===undefined?undefined:JSON.stringify(body)});
    const data=await res.json().catch(()=>({ok:false,error:'INVALID_JSON'}));
    if(!res.ok||data.ok===false){const error=new Error(data.error||('PRODUCTION_API_'+res.status));error.status=res.status;error.data=data;throw error;}
    return data;
  }
  const mapBlock=b=>({id:b.id,code:b.code,name:b.name,status:b.status,scopeId:b.scope_id,metadata:b.metadata||{},createdAt:b.created_at,updatedAt:b.updated_at,source:'PRODUCTION_DB'});
  const mapRoom=r=>({id:r.id,code:r.code,blockId:r.block_id,block:null,room:r.name,name:r.name,capacity:Number(r.capacity)||0,status:r.status,type:r.type||'STANDARD',gender:r.gender||'UMUM',scopeId:r.scope_id,version:r.version||1,metadata:r.metadata||{},createdAt:r.created_at,updatedAt:r.updated_at,source:'PRODUCTION_DB'});
  const mapDetainee=d=>({id:d.id,code:d.code,name:d.name,nationality:d.nationality||'',status:d.status,placement:d.placement||'',scopeId:d.scope_id,metadata:d.metadata||{},createdAt:d.created_at,updatedAt:d.updated_at,source:'PRODUCTION_DB'});
  const mapPlacement=p=>({id:p.id,detaineeId:p.detainee_id,blockId:p.block_id,roomId:p.room_id,block:p.block||'',room:p.room||'',since:p.since,until:p.until||null,movementId:p.movement_id||null,correlationId:p.correlation_id||null,requestKey:p.request_key||null,metadata:p.metadata||{},createdAt:p.created_at,source:'PRODUCTION_DB'});
  const mapMovement=m=>({id:m.id,detaineeId:m.detainee_id,type:m.movement_type,destination:m.destination||'',purpose:m.purpose||'',occurredAt:m.occurred_at,createdAt:m.created_at,metadata:m.metadata||{},source:'PRODUCTION_DB'});
  const mapLeave=l=>({id:l.id,detaineeId:l.detainee_id,destination:l.destination||'',purpose:l.purpose||'',startAt:l.start_at,status:l.status,metadata:l.metadata||{},createdAt:l.created_at,updatedAt:l.updated_at,source:'PRODUCTION_DB'});
  const mapDocument=d=>({id:d.id,documentId:d.document_id,documentType:d.document_type,reportDate:d.report_date,reguId:d.regu_id,shiftId:d.shift_id,status:d.status,revision:d.revision,revisionOf:d.revision_of,templateVersion:d.template_version,integrityHash:d.integrity_hash,filename:d.filename,payload:d.payload||{},createdAt:d.created_at,validatedAt:d.validated_at,generatedAt:d.generated_at,reviewStartedAt:d.review_started_at,approvedAt:d.approved_at,finalizedAt:d.finalized_at,createdBy:d.created_by,updatedAt:d.updated_at,source:'PRODUCTION_DB'});
  const mapAudit=a=>({id:a.id,action:a.action,resourceType:a.resource_type,resourceId:a.resource_id,result:a.result,actor:a.actor_user_id||'',requestId:a.request_id||'',correlationId:a.correlation_id||'',occurredAt:a.occurred_at,metadata:a.metadata||{},previousHash:a.previous_hash||null,eventHash:a.event_hash||null,hashVersion:a.hash_version||null,source:'PRODUCTION_DB'});
  async function hydrate(){
    if(!isProduction())return null;
    const [blocks,rooms,detainees,placements,movements,leaves,documents,audit]=await Promise.all(['blocks','rooms','detainees','placements','movements','leaves','documents','audit'].map(resource=>request(resource)));
    const byBlock=new Map(blocks.data.map(mapBlock).map(b=>[b.id,b]));
    const rs=rooms.data.map(mapRoom).map(r=>({...r,block:byBlock.get(r.blockId)?.name||''}));
    const ds=detainees.data.map(mapDetainee);
    const ps=placements.data.map(mapPlacement).map(p=>{const room=rs.find(r=>r.id===p.roomId);return {...p,block:p.block||room?.block||'',room:p.room||room?.room||''}});
    const state={meta:{version:4,mode:'PRODUCTION',loadedAt:new Date().toISOString()},blocks:blocks.data.map(mapBlock),rooms:rs,detainees:ds,placements:ps,movements:movements.data.map(mapMovement),leaves:leaves.data.map(mapLeave),documents:documents.data.map(mapDocument),audit:audit.data.map(mapAudit)};
    for(const k of ['blocks','rooms','detainees','placements','movements','leaves','documents','audit'])if(!Array.isArray(state[k]))state[k]=[];
    window.__mtaProductionState=Object.freeze(structuredClone(state));
    window.__mtaRuntimeStatus={mode:'PRODUCTION',database:'CONNECTED',ai:'OFF',syntheticOnly:false,readOnly:false,loadedAt:state.meta.loadedAt};
    return state;
  }
  async function executeMovement({detaineeId,targetRoomId,movementType='TRANSFER',purpose=null,occurredAt,idempotencyKey,requestId,correlationId}={}){
    if(!isProduction())throw new Error('PRODUCTION_COMMAND_OUTSIDE_PRODUCTION');
    const cleanDetaineeId=String(detaineeId||'').trim(),cleanRoomId=String(targetRoomId||'').trim();
    if(!cleanDetaineeId||!cleanRoomId)throw new Error('MOVE_DETAINEE_IDENTIFIERS_REQUIRED');
    const requestKey=String(idempotencyKey||('MOVE_DETAINEE:'+cleanDetaineeId+':'+cleanRoomId+':'+String(occurredAt||''))).trim();
    const correlation=String(correlationId||crypto.randomUUID()).trim(),reqId=String(requestId||crypto.randomUUID()).trim();
    if(requestKey.length<8)throw new Error('MOVE_DETAINEE_IDEMPOTENCY_KEY_INVALID');
    const body={command:'MOVE_DETAINEE',detaineeId:cleanDetaineeId,targetRoomId:cleanRoomId,movementType:String(movementType||'TRANSFER'),purpose:purpose===null||purpose===undefined?null:String(purpose),occurredAt:occurredAt||new Date().toISOString()};
    const result=await request('movements',{method:'POST',body,headers:{'X-Request-Id':reqId,'X-Correlation-Id':correlation,'Idempotency-Key':requestKey}});
    await hydrate();
    window.__mtaRuntimeStatus={...(window.__mtaRuntimeStatus||{}),readOnly:false,lastCommand:{command:'MOVE_DETAINEE',movementId:result.data?.movementId||null,placementId:result.data?.placementId||null,auditEventId:result.data?.auditEventId||null,replayed:!!result.replayed,requestId:reqId,correlationId:result.data?.correlationId||correlation,idempotencyKey:requestKey,committedAt:new Date().toISOString()}};
    return result;
  }
  async function refresh(){return hydrate()}
  function assertProductionReadOnly(){if(isProduction())throw new Error('PRODUCTION_FOUNDATION_READ_ONLY')}
  window.mtaProductionStateAdapter=Object.freeze({isProduction,hydrate,refresh,executeMovement,get:()=>state(),apiBase:API,request});
})();