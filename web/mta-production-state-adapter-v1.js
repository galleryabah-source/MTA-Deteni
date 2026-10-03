(()=>{
  'use strict';
  const API='https://tmmhxqgzelgrsrxbbfzh.supabase.co/functions/v1/mta-api';
  // Production is explicit. Staging/preview workers remain synthetic unless deliberately promoted.
  const PRODUCTION_HOSTS=new Set(['mta-deteni.galleryabah.workers.dev']);
  // Governance lock: production mutation remains disabled until explicit release.
  const PRODUCTION_MUTATIONS_ENABLED=false;
  // UAT release: only the canonical detainee create/update boundary is enabled.
  // Generic resource, movement, and backup-restore mutations remain locked.
  const PRODUCTION_DETAINEE_MUTATIONS_ENABLED=true;
  const REQUEST_TIMEOUT_MS=10000;
  const isProduction=()=>PRODUCTION_HOSTS.has(location.hostname);
  const withTimeout=async(promise,ms=REQUEST_TIMEOUT_MS,code='PRODUCTION_API_TIMEOUT')=>{
    let timer;
    try{
      return await Promise.race([promise,new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error(code)),ms)})]);
    }finally{clearTimeout(timer)}
  };
  const isProductionPersistenceEnabled=()=>isProduction()&&PRODUCTION_MUTATIONS_ENABLED;
  const state=()=>window.__mtaProductionState||null;
  const session=async()=>{
    // Production runtime only needs the bearer credential to call the
    // server-side /me contract. Read the persisted raw session directly first
    // so operational hydration does not re-enter the Supabase Auth SDK lock
    // immediately after the authenticated shell has been restored.
    try{
      const raw=window.localStorage?.getItem('mta-deteni-auth-session');
      if(raw){
        const parsed=JSON.parse(raw);
        if(parsed?.access_token)return parsed;
      }
    }catch{}
    const r=await window.mtaAuth?.session?.();
    return r?.data?.session||null;
  };
  async function request(resource,{method='GET',id,body,headers={},sessionOverride=null}={}){
    let s=sessionOverride||await session();
    if(!s?.access_token)throw new Error('PRODUCTION_AUTH_REQUIRED');
    const path=API+'/'+encodeURIComponent(resource)+(id?'/'+encodeURIComponent(id):'');
    const init=()=>({method,headers:{Authorization:'Bearer '+s.access_token,Accept:'application/json',...(body!==undefined?{'Content-Type':'application/json'}:{}),...headers},body:body===undefined?undefined:JSON.stringify(body)});
    let res=await withTimeout(fetch(path,init()));
    if(res.status===401&&window.mtaAuth?.refreshSession){
      try{
        const refreshed=await window.mtaAuth.refreshSession();
        if(refreshed?.access_token){s=refreshed;res=await withTimeout(fetch(path,init()));}
      }catch{}
    }
    const data=await res.json().catch(()=>({ok:false,error:'INVALID_JSON'}));
    if(!res.ok||data.ok===false){const error=new Error(data.error||('PRODUCTION_API_'+res.status));error.status=res.status;error.data=data;throw error;}
    return data;
  }
  const mapBlock=b=>({id:b.id,code:b.code,name:b.name,status:b.status,scopeId:b.scope_id,metadata:b.metadata||{},createdAt:b.created_at,updatedAt:b.updated_at,source:'PRODUCTION_DB'});
  const mapRoom=r=>({id:r.id,code:r.code,blockId:r.block_id,block:null,room:r.name,name:r.name,capacity:Number(r.capacity)||0,status:r.status,type:r.type||'STANDARD',gender:r.gender||'UMUM',scopeId:r.scope_id,version:r.version||1,metadata:r.metadata||{},createdAt:r.created_at,updatedAt:r.updated_at,source:'PRODUCTION_DB'});
  const mapDetainee=d=>{
    const metadata=d.metadata&&typeof d.metadata==='object'?d.metadata:{};
    return {id:d.id,nid:d.nid||'',code:d.code,name:d.name,nationality:d.nationality||'',status:d.status,placement:d.placement||'',gender:String(metadata.gender||''),dateOfBirth:String(metadata.dateOfBirth||''),passportNumber:String(metadata.passportNumber||''),notes:String(metadata.notes||''),scopeId:d.scope_id,metadata,correlationId:String(metadata.correlationId||''),createdAt:d.created_at,updatedAt:d.updated_at,source:'PRODUCTION_DB'};
  };
  const mapPlacement=p=>({id:p.id,detaineeId:p.detainee_id,blockId:p.block_id,roomId:p.room_id,block:p.block||'',room:p.room||'',since:p.since,until:p.until||null,movementId:p.movement_id||null,correlationId:p.correlation_id||null,requestKey:p.request_key||null,metadata:p.metadata||{},createdAt:p.created_at,source:'PRODUCTION_DB'});
  const mapMovement=m=>({id:m.id,detaineeId:m.detainee_id,type:m.movement_type,destination:m.destination||'',purpose:m.purpose||'',occurredAt:m.occurred_at,createdAt:m.created_at,metadata:m.metadata||{},source:'PRODUCTION_DB'});
  const mapLeave=l=>({id:l.id,detaineeId:l.detainee_id,destination:l.destination||'',purpose:l.purpose||'',startAt:l.start_at,status:l.status,metadata:l.metadata||{},createdAt:l.created_at,updatedAt:l.updated_at,source:'PRODUCTION_DB'});
  const mapDocument=d=>({id:d.id,documentId:d.document_id,documentType:d.document_type,reportDate:d.report_date,reguId:d.regu_id,shiftId:d.shift_id,status:d.status,revision:d.revision,revisionOf:d.revision_of,templateVersion:d.template_version,integrityHash:d.integrity_hash,filename:d.filename,payload:d.payload||{},createdAt:d.created_at,validatedAt:d.validated_at,generatedAt:d.generated_at,reviewStartedAt:d.review_started_at,approvedAt:d.approved_at,finalizedAt:d.finalized_at,createdBy:d.created_by,updatedAt:d.updated_at,source:'PRODUCTION_DB'});
  const mapAudit=a=>({id:a.id,action:a.action,resourceType:a.resource_type,resourceId:a.resource_id,result:a.result,actor:a.actor_user_id||'',requestId:a.request_id||'',correlationId:a.correlation_id||'',occurredAt:a.occurred_at,metadata:a.metadata||{},previousHash:a.previous_hash||null,eventHash:a.event_hash||null,hashVersion:a.hash_version||null,source:'PRODUCTION_DB'});
  const norm=v=>String(v||'').trim().toLowerCase().replace(/\\s+/g,' ');
  function projectLegacyPlacements(detainees,rooms,placements){
    const existing=new Set((placements||[]).map(p=>String(p?.detaineeId||'')));
    const projected=[];
    for(const d of (detainees||[])){
      if(d?.status!=='AKTIF'||!d?.placement||existing.has(String(d.id)))continue;
      const raw=String(d.placement).trim();
      const parts=raw.split(/\s*\/\s*/);
      if(parts.length!==2)continue;
      const blockName=norm(parts[0]),roomName=norm(parts[1]);
      const room=rooms.find(r=>norm(r?.room)===roomName&&norm(r?.block)===blockName)
        ||rooms.find(r=>norm(r?.room)===roomName&&(!r?.block||!blockName));
      if(!room)continue;
      projected.push({
        id:'LEGACY-PLACEMENT-'+String(d.id),
        detaineeId:d.id,
        blockId:room.blockId||null,
        roomId:room.id,
        block:room.block||parts[0].trim(),
        room:room.room||parts[1].trim(),
        since:d.updatedAt||d.createdAt||new Date().toISOString(),
        until:null,
        movementId:null,
        correlationId:d.correlationId||null,
        requestKey:null,
        metadata:{legacyProjection:true,sourceField:'mta_detainees.placement',sourceValue:raw},
        createdAt:d.createdAt||null,
        source:'PRODUCTION_DB_LEGACY_PLACEMENT'
      });
    }
    return projected;
  }
  async function hydrate(){
    if(!isProduction())return null;
    // Canonical hydration order is explicit: authenticated API identity first,
    // then the nine canonical resources. The privileged admin-config resource
    // is part of the contract but is not allowed to block operational hydration
    // when the authenticated user has no admin scope.
    const sessionToken=await session();
    if(!sessionToken?.access_token)throw new Error('PRODUCTION_AUTH_REQUIRED');
    const me=await request('me',{sessionOverride:sessionToken});
    if(!me?.user||!me?.profile)throw new Error('PRODUCTION_IDENTITY_INVALID');
    const resources=['blocks','rooms','detainees','placements','movements','leaves','documents','audit'];
    const [blocks,rooms,detainees,placements,movements,leaves,documents,audit]=await Promise.all(resources.map(resource=>request(resource,{sessionOverride:sessionToken})));
    let adminConfig={ok:true,data:{settings:{}},skipped:false};
    try{
      adminConfig=await request('admin-config',{sessionOverride:sessionToken});
    }catch(error){
      // admin-config is optional for operational hydration. 403/409 are
      // authorization boundaries and 404 means this deployment has no
      // admin-config route; none of these conditions may block the canonical
      // operational runtime from reaching CONNECTED/LOADED.
      if(error?.status!==403&&error?.status!==404&&error?.status!==409)throw error;
      adminConfig={ok:true,data:{settings:{}},skipped:true,reason:error?.data?.error||error?.message||'ADMIN_CONFIG_UNAVAILABLE'};
    }
    const byBlock=new Map(blocks.data.map(mapBlock).map(b=>[b.id,b]));
    const rs=rooms.data.map(mapRoom).map(r=>({...r,block:byBlock.get(r.blockId)?.name||''}));
    const ds=detainees.data.map(mapDetainee);
    const ps=placements.data.map(mapPlacement).map(p=>{const room=rs.find(r=>r.id===p.roomId);return {...p,block:p.block||room?.block||'',room:p.room||room?.room||''}});
    const legacyProjected=projectLegacyPlacements(ds,rs,ps);
    const effectivePlacements=[...ps,...legacyProjected];
    const state={meta:{version:4,mode:'PRODUCTION',loadedAt:new Date().toISOString()},blocks:blocks.data.map(mapBlock),rooms:rs,detainees:ds,placements:effectivePlacements,movements:movements.data.map(mapMovement),leaves:leaves.data.map(mapLeave),documents:documents.data.map(mapDocument),audit:audit.data.map(mapAudit),adminSettings:{...(adminConfig.data?.settings||{}),role:String(me.role||me.profile?.role||'').toUpperCase()},legacyPlacementProjectionCount:legacyProjected.length};
    for(const k of ['blocks','rooms','detainees','placements','movements','leaves','documents','audit'])if(!Array.isArray(state[k]))state[k]=[];
    window.__mtaProductionState=Object.freeze(structuredClone(state));
    window.__mtaRuntimeStatus={mode:'PRODUCTION',database:'CONNECTED',ai:'OFF',syntheticOnly:false,readOnly:false,identity:'VALIDATED',adminConfig:adminConfig.skipped?'RBAC_BOUNDARY':'LOADED',loadedAt:state.meta.loadedAt};
    return state;
  }
  async function writeAudit(){
    // Client-originated audit writes are intentionally disabled. Audit records
    // must be emitted by the server-side canonical mutation transaction.
    return {ok:false,code:'AUDIT_WRITE_DISABLED'};
  }
  async function mutateResource(resource,operation,{id,body={},requestId,correlationId,idempotencyKey}={}){
    if(!isProductionPersistenceEnabled())throw new Error('PRODUCTION_MUTATION_NOT_AUTHORIZED');
    const method=operation==='create'?'POST':operation==='update'?'PATCH':operation==='delete'?'DELETE':null;
    if(!method)throw new Error('PRODUCTION_MUTATION_OPERATION_INVALID');
    const key=String(idempotencyKey||'').trim();
    if(!key)throw new Error('IDEMPOTENCY_KEY_REQUIRED');
    const requestHeaders={
      'X-Request-Id':String(requestId||crypto.randomUUID()),
      'X-Correlation-Id':String(correlationId||crypto.randomUUID()),
      ...(idempotencyKey?{'Idempotency-Key':String(idempotencyKey)}:{})
    };
    const result=await request(resource,{method,id,body:method==='DELETE'?undefined:body,headers:requestHeaders});
    const refreshed=await hydrate();
    return {ok:true,code:'PRODUCTION_'+resource.toUpperCase()+'_'+operation.toUpperCase()+'_COMMITTED',data:result.data,row:result.row,state:refreshed,replayed:!!result.replayed,requestId:requestHeaders['X-Request-Id'],correlationId:requestHeaders['X-Correlation-Id']};
  }
  async function executeMovement({detaineeId,targetRoomId,movementType='TRANSFER',purpose=null,occurredAt,idempotencyKey,requestId,correlationId}={}){
    if(!isProductionPersistenceEnabled())throw new Error('PRODUCTION_MUTATION_NOT_AUTHORIZED');
    const cleanDetaineeId=String(detaineeId||'').trim(),cleanRoomId=String(targetRoomId||'').trim();
    if(!cleanDetaineeId||!cleanRoomId)throw new Error('MOVE_DETAINEE_IDENTIFIERS_REQUIRED');
    const requestKey=String(idempotencyKey||'').trim();
    const correlation=String(correlationId||crypto.randomUUID()).trim(),reqId=String(requestId||crypto.randomUUID()).trim();
    if(requestKey.length<8)throw new Error('MOVE_DETAINEE_IDEMPOTENCY_KEY_INVALID');
    const body={command:'MOVE_DETAINEE',detaineeId:cleanDetaineeId,targetRoomId:cleanRoomId,movementType:String(movementType||'TRANSFER'),purpose:purpose===null||purpose===undefined?null:String(purpose),occurredAt:occurredAt||new Date().toISOString()};
    const result=await request('movements',{method:'POST',body,headers:{'X-Request-Id':reqId,'X-Correlation-Id':correlation,'Idempotency-Key':requestKey}});
    await hydrate();
    window.__mtaRuntimeStatus={...(window.__mtaRuntimeStatus||{}),readOnly:false,lastCommand:{command:'MOVE_DETAINEE',movementId:result.data?.movementId||null,placementId:result.data?.placementId||null,auditEventId:result.data?.auditEventId||null,replayed:!!result.replayed,requestId:reqId,correlationId:result.data?.correlationId||correlation,idempotencyKey:requestKey,committedAt:new Date().toISOString()}};
    return result;
  }
  async function mutateDetainee(operation,args={}){
    if(Object.prototype.hasOwnProperty.call(args,'nid'))return{ok:false,code:operation==='create'?'NID_SYSTEM_GENERATED':'NID_IMMUTABLE'};
    if(operation==='update'&&Object.prototype.hasOwnProperty.call(args,'entryYear'))return{ok:false,code:'ENTRY_YEAR_IMMUTABLE'};
    const {id,code,name,nationality,status,placement,gender,dateOfBirth,passportNumber,notes,entryYear,identityDecision,correlationId,requestId,idempotencyKey}=args;
    if(!isProduction()||!PRODUCTION_DETAINEE_MUTATIONS_ENABLED)throw new Error('PRODUCTION_MUTATION_NOT_AUTHORIZED');
    const correlation=String(correlationId||crypto.randomUUID());
    const key=String(idempotencyKey||'').trim();
    if(!key)throw new Error('IDEMPOTENCY_KEY_REQUIRED');
    const clean={code:String(code||'').trim(),name:String(name||'').trim(),nationality:String(nationality||'').trim(),status:String(status||'AKTIF'),placement:String(placement||'').trim(),updated_at:new Date().toISOString(),metadata:{gender:String(gender||''),dateOfBirth:String(dateOfBirth||''),passportNumber:String(passportNumber||''),notes:String(notes||''),correlationId:correlation,source:'PRODUCTION_RUNTIME'},identity_decision:String(identityDecision||'')};
    if(operation==='create'){
      if(!clean.code||!clean.name)throw new Error('DETAINEE_INPUT_INVALID');
      const normalizedEntryYear=Number(entryYear);
      if(!Number.isInteger(normalizedEntryYear)||normalizedEntryYear<2000||normalizedEntryYear>2099)throw new Error('ENTRY_YEAR_REQUIRED');
      clean.entry_year=normalizedEntryYear;
      const result=await request('detainees',{method:'POST',body:clean,headers:{'X-Request-Id':String(requestId||crypto.randomUUID()),'X-Correlation-Id':clean.metadata.correlationId,'Idempotency-Key':key}});
      const refreshed=await hydrate();
      return {ok:true,code:'DETAINEE_CREATED',data:result.data,state:refreshed,correlationId};
    }
    if(!id)throw new Error('DETAINEE_ID_REQUIRED');
    if(operation==='update'){
      const result=await request('detainees',{method:'PATCH',id:String(id),body:clean,headers:{'X-Request-Id':String(requestId||crypto.randomUUID()),'X-Correlation-Id':clean.metadata.correlationId,'Idempotency-Key':key}});
      const refreshed=await hydrate();
      return {ok:true,code:'DETAINEE_UPDATED',data:result.data,state:refreshed,correlationId};
    }
    if(operation==='archive'){
      const current=state()?.detainees?.find(x=>String(x.id)===String(id));
      const metadata={...(current?.metadata||{}),archiveReason:'USER_ARCHIVE',archivedAt:new Date().toISOString(),correlationId:correlation};
      const result=await request('detainees',{method:'PATCH',id:String(id),body:{status:'NONAKTIF',updated_at:new Date().toISOString(),metadata},headers:{'X-Request-Id':String(requestId||crypto.randomUUID()),'X-Correlation-Id':correlation,'Idempotency-Key':key}});
      const refreshed=await hydrate();
      return {ok:true,code:'DETAINEE_ARCHIVED',data:result.data,state:refreshed,correlationId};
    }
    throw new Error('DETAINEE_MUTATION_OPERATION_INVALID');
  }
  async function createBackup(){
    if(!isProduction())throw new Error('NOT_PRODUCTION');
    return request('backup',{method:'GET'});
  }
  async function restoreBackup(snapshot){
    if(!isProductionPersistenceEnabled())throw new Error('PRODUCTION_MUTATION_NOT_AUTHORIZED');
    if(!snapshot||typeof snapshot!=='object')throw new Error('BACKUP_INVALID');
    const restoreKey=String(snapshot?.manifest?.backupId||'').trim();
    if(!restoreKey)throw new Error('IDEMPOTENCY_KEY_REQUIRED');
    const response=await request('backup-restore',{method:'POST',body:snapshot,headers:{'X-Request-Id':crypto.randomUUID(),'X-Correlation-Id':crypto.randomUUID(),'Idempotency-Key':restoreKey}});
    const refreshed=await hydrate();
    return {...response,state:refreshed,replayed:!!response.replayed};
  }
  async function refresh(){return hydrate()}
  window.mtaProductionStateAdapter=Object.freeze({isProduction,isProductionPersistenceEnabled,hydrate,refresh,createBackup,restoreBackup,executeMovement,mutateResource,writeAudit,mutateDetainee,get:()=>state(),apiBase:API,request});
})();