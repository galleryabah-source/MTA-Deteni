(()=>{
'use strict';
if(window.MTADeteniStateKernel)return;
const KEY='mta-deteni-demo-v2';
const BRANDING_KEY='mta-deteni-branding-v1';
const RUNTIME_URL='/api/runtime';
const RESOURCES=['detainees','placements','movements','leaves','documents'];
const clone=v=>JSON.parse(JSON.stringify(v));
const uid=p=>p+'-'+crypto.randomUUID().slice(0,10).toUpperCase();
const now=()=>new Date().toISOString();
let runtimeContract={mode:'SYNTHETIC_RUNTIME_DIAGNOSTIC',productionAccessAuthorized:false,livePostgresqlExecution:false};
let remoteState=null;
let remoteSnapshot=null;
let readyPromise=null;
let syncChain=Promise.resolve();
let lastSync={status:'SYNTHETIC',at:null,error:null};

function normalize(state){
  if(!state||typeof state!=='object')throw new Error('STATE_INVALID');
  for(const k of ['detainees','placements','movements','leaves','documents','audit','rooms','blocks'])if(!Array.isArray(state[k]))state[k]=[];
  state.qr=state.qr&&typeof state.qr==='object'?state.qr:{detainee:{},room:{},leave:{}};
  for(const k of ['detainee','room','leave'])state.qr[k]=state.qr[k]&&typeof state.qr[k]==='object'?state.qr[k]:{};
  if(!state.rooms.length&&state.detainees.some(d=>d?.placement)){
    const placements=[...new Set(state.detainees.map(d=>String(d.placement||'')).filter(Boolean))];
    placements.forEach((label,i)=>{
      const [block,room]=label.split(' / ').map(x=>String(x||'').trim());
      if(!block||!room)return;
      let b=state.blocks.find(x=>x.name===block);
      if(!b){b={id:'BLK-SYN-'+String(i+1).padStart(3,'0'),name:block,status:'ACTIVE',source:'SYNTHETIC_NORMALIZATION'};state.blocks.push(b)}
      state.rooms.push({id:'ROOM-SYN-'+String(i+1).padStart(3,'0'),blockId:b.id,block,room,capacity:8,status:'ACTIVE',type:'STANDARD',gender:'UMUM',source:'SYNTHETIC_NORMALIZATION',version:1});
    });
  }
  state.rooms.forEach((r,i)=>{
    if(r?.block&&!r.blockId){
      let b=state.blocks.find(x=>x.name===r.block);
      if(!b){b={id:'BLK-SYN-R'+String(i+1).padStart(3,'0'),name:r.block,status:'ACTIVE',source:'SYNTHETIC_NORMALIZATION'};state.blocks.push(b)}
      r.blockId=b.id;
    }
  });
  const roomByLabel=new Map(state.rooms.map(r=>[String(r.block||'')+' / '+String(r.room||''),r]));
  state.placements.forEach(p=>{
    if(!p?.roomId){
      const r=roomByLabel.get(String(p?.block||'')+' / '+String(p?.room||''));
      if(r){p.roomId=r.id;p.blockId=p.blockId||r.blockId;p.source=p.source||'LEGACY_NORMALIZED'}
    }
  });
  return state;
}

function readLocal(){
  try{
    const raw=localStorage.getItem(KEY);
    const state=normalize(raw?JSON.parse(raw):{});
    try{const b=JSON.parse(localStorage.getItem(BRANDING_KEY)||'null');if(b){state.adminSettings=state.adminSettings||{};state.adminSettings.branding=b}}catch{}
    return state;
  }catch(err){console.error('[MTA] state read failed',err);return {}}
}

function persistLocal(state){
  const branding=state.adminSettings?.branding;
  const copy=clone(state);
  if(copy.adminSettings)delete copy.adminSettings.branding;
  const serialized=JSON.stringify(copy);
  localStorage.setItem(KEY,serialized);
  if(localStorage.getItem(KEY)!==serialized)throw new Error('STORAGE_VERIFY_FAILED');
  if(branding)localStorage.setItem(BRANDING_KEY,JSON.stringify(branding));
  window.dispatchEvent(new CustomEvent('mta:data-changed',{detail:{source:'state-kernel'}}));
  return true;
}

function apiEnabled(){
  return !!(runtimeContract.productionAccessAuthorized&&runtimeContract.livePostgresqlExecution&&window.mtaProductionApi);
}

function mapDetainee(r){return {...r,createdAt:r.created_at||r.createdAt,updatedAt:r.updated_at||r.updatedAt,source:r.source||'PRODUCTION_RUNTIME'};}
function mapPlacement(r){
  const m=r.metadata&&typeof r.metadata==='object'?r.metadata:{};
  return {id:r.id,detaineeId:r.detainee_id,block:r.block||m.block||'',room:r.room||m.room||'',roomId:m.roomId||null,blockId:m.blockId||null,since:r.since,until:r.until||null,source:m.source||'PRODUCTION_RUNTIME',movementId:m.movementId||null,metadata:m};
}
function mapMovement(r){
  const m=r.metadata&&typeof r.metadata==='object'?r.metadata:{};
  return {id:r.id,detaineeId:r.detainee_id,detaineeCode:m.detaineeCode||'',type:r.movement_type||m.type||'MOVEMENT',location:r.destination||m.location||'',destination:r.destination||'',purpose:r.purpose||m.purpose||'',note:m.note||r.purpose||'',occurredAt:r.occurred_at,createdAt:r.created_at,source:m.source||'PRODUCTION_RUNTIME',requestKey:m.requestKey||null,metadata:m};
}
function mapLeave(r){
  const m=r.metadata&&typeof r.metadata==='object'?r.metadata:{};
  return {id:r.id,detaineeId:r.detainee_id,destination:r.destination||'',purpose:r.purpose||'',startAt:r.start_at,status:r.status||'DRAFT',createdAt:r.created_at,updatedAt:r.updated_at,requestKey:m.requestKey||null,correlationId:m.correlationId||null,metadata:m};
}
function mapDocument(r){
  const p=r.payload&&typeof r.payload==='object'?r.payload:{};
  return {...p,id:r.id,documentId:r.document_id,documentType:r.document_type,reportDate:r.report_date,reguId:r.regu_id,shiftId:r.shift_id,status:r.status,revision:r.revision,revisionOf:r.revision_of,templateVersion:r.template_version,integrityHash:r.integrity_hash,filename:r.filename,createdAt:r.created_at,validatedAt:r.validated_at,generatedAt:r.generated_at,reviewStartedAt:r.review_started_at,approvedAt:r.approved_at,finalizedAt:r.finalized_at};
}
function mapAudit(r){return {...r,resourceType:r.resource_type,resourceId:r.resource_id,actor:r.actor_user_id||r.actor||'SYSTEM',occurredAt:r.occurred_at,requestId:r.request_id,correlationId:r.correlation_id};}

async function fetchRemoteState(){
  if(!apiEnabled())return null;
  const [detainees,placements,movements,leaves,documents,audit]=await Promise.all([
    window.mtaProductionApi.list('detainees'),
    window.mtaProductionApi.list('placements'),
    window.mtaProductionApi.list('movements'),
    window.mtaProductionApi.list('leaves'),
    window.mtaProductionApi.list('documents'),
    window.mtaProductionApi.list('audit')
  ]);
  const base=readLocal();
  const state=normalize({
    ...base,
    detainees:(detainees.data||[]).map(mapDetainee),
    placements:(placements.data||[]).map(mapPlacement),
    movements:(movements.data||[]).map(mapMovement),
    leaves:(leaves.data||[]).map(mapLeave),
    documents:(documents.data||[]).map(mapDocument),
    audit:(audit.data||[]).map(mapAudit)
  });
  remoteSnapshot=clone(state);
  return state;
}

function stripMeta(v){
  const x=clone(v||{});
  delete x.id; delete x.createdAt; delete x.updatedAt;
  return x;
}
function toDetainee(x){return {code:x.code,name:x.name,nationality:x.nationality||null,status:x.status||'AKTIF',placement:x.placement||null,source:x.source||'PRODUCTION_RUNTIME',metadata:x.metadata||{}}}
function toPlacement(x){return {detainee_id:x.detaineeId,block:x.block||null,room:x.room||null,since:x.since||now(),until:x.until||null,metadata:{...(x.metadata||{}),roomId:x.roomId||null,blockId:x.blockId||null,source:x.source||'PRODUCTION_RUNTIME',movementId:x.movementId||null}}}
function toMovement(x){return {detainee_id:x.detaineeId,movement_type:x.type||x.kind||'MOVEMENT',destination:x.destination||x.location||null,purpose:x.purpose||x.note||null,occurred_at:x.occurredAt||now(),metadata:{...(x.metadata||{}),detaineeCode:x.detaineeCode||'',location:x.location||x.destination||'',note:x.note||'',source:x.source||'PRODUCTION_RUNTIME',requestKey:x.requestKey||null}}}
function toLeave(x){return {detainee_id:x.detaineeId,destination:x.destination||null,purpose:x.purpose||null,start_at:x.startAt||null,status:x.status||'DRAFT',metadata:{...(x.metadata||{}),requestKey:x.requestKey||null,correlationId:x.correlationId||null}}}
function toDocument(x){
  const payload=stripMeta(x);
  for(const k of ['documentId','documentType','reportDate','reguId','shiftId','status','revision','revisionOf','templateVersion','integrityHash','filename'])delete payload[k];
  return {document_id:x.documentId||x.id,document_type:x.documentType||'MTA_DAILY_GUARD_REPORT',report_date:x.reportDate||null,regu_id:x.reguId||null,shift_id:x.shiftId||null,status:x.status||'DRAFT',revision:Number(x.revision||1),revision_of:x.revisionOf||null,template_version:x.templateVersion||null,integrity_hash:x.integrityHash||null,filename:x.filename||null,payload};
}
const converters={detainees:toDetainee,placements:toPlacement,movements:toMovement,leaves:toLeave,documents:toDocument};

async function syncCollection(resource,nextRows,prevRows){
  const prevById=new Map((prevRows||[]).filter(x=>x?.id).map(x=>[String(x.id),x]));
  const nextById=new Map((nextRows||[]).filter(x=>x?.id).map(x=>[String(x.id),x]));
  for(const item of nextRows||[]){
    const id=String(item.id||'');
    const old=prevById.get(id);
    if(!old){
      const result=await window.mtaProductionApi.create(resource,converters[resource](item));
      const row=result.row||result.data;
      if(row?.id&&item.id!==row.id)item.id=row.id;
      continue;
    }
    const oldPayload=JSON.stringify(converters[resource](old));
    const nextPayload=JSON.stringify(converters[resource](item));
    if(oldPayload!==nextPayload)await window.mtaProductionApi.update(resource,id,converters[resource](item));
  }
  for(const [id] of prevById){
    if(!nextById.has(id))await window.mtaProductionApi.remove(resource,id);
  }
}

async function syncRemote(state){
  if(!apiEnabled())return;
  if(!remoteSnapshot)remoteSnapshot=clone(state);
  for(const resource of RESOURCES)await syncCollection(resource,state[resource]||[],remoteSnapshot[resource]||[]);
  remoteSnapshot=clone(state);
  lastSync={status:'SYNCED',at:now(),error:null};
  window.dispatchEvent(new CustomEvent('mta:remote-sync',{detail:clone(lastSync)}));
}

function write(state){
  normalize(state);
  if(!apiEnabled()){persistLocal(state);lastSync={status:'SYNTHETIC',at:now(),error:null};return true}
  persistLocal(state);
  const snapshot=clone(state);
  syncChain=syncChain.then(()=>syncRemote(snapshot)).catch(err=>{
    lastSync={status:'ERROR',at:now(),error:err?.message||'REMOTE_SYNC_FAILED'};
    console.error('[MTA] remote sync failed',err);
    window.dispatchEvent(new CustomEvent('mta:remote-sync',{detail:clone(lastSync)}));
  });
  return true;
}

async function initialize(){
  if(readyPromise)return readyPromise;
  readyPromise=(async()=>{
    try{
      const response=await fetch(RUNTIME_URL,{cache:'no-store'});
      if(response.ok)runtimeContract=await response.json();
    }catch(err){console.warn('[MTA] runtime contract unavailable; synthetic mode retained',err)}
    if(apiEnabled()){
      try{
        remoteState=await fetchRemoteState();
        if(remoteState){persistLocal(remoteState);lastSync={status:'SYNCED',at:now(),error:null}}
      }catch(err){
        runtimeContract={...runtimeContract,productionAccessAuthorized:false,livePostgresqlExecution:false};
        lastSync={status:'ERROR',at:now(),error:err?.message||'REMOTE_HYDRATION_FAILED'};
        console.error('[MTA] production hydration failed; refusing synthetic fallback',err);
        remoteState=null;
        throw err;
      }
    }
    return runtimeContract;
  })();
  return readyPromise;
}

function read(){return normalize(remoteState?clone(remoteState):readLocal())}
function audit(state,action,resourceType,resourceId,result='SUCCESS',meta={}){
  state.audit=Array.isArray(state.audit)?state.audit:[];
  const event={id:uid('AUD'),action,resourceType,resourceId:resourceId||'',result,occurredAt:now(),actor:meta.actor||'SYSTEM',requestId:meta.requestId||uid('REQ'),correlationId:meta.correlationId||uid('COR'),policyVersion:meta.policyVersion||'AUTHZ-1.0'};
  state.audit.unshift(event);
  return event;
}
function contractTest(){
  const probe=normalize(clone(read()));
  const ok=typeof read==='function'&&typeof write==='function'&&typeof initialize==='function'&&Array.isArray(probe.detainees)&&Array.isArray(probe.audit);
  return {ok,mode:apiEnabled()?'PRODUCTION':'SYNTHETIC',runtimeContract:clone(runtimeContract),lastSync:clone(lastSync),checks:[
    {name:'KERNEL_READ',ok:typeof read==='function'},
    {name:'KERNEL_WRITE',ok:typeof write==='function'},
    {name:'REMOTE_API_ADAPTER',ok:!!window.mtaProductionApi},
    {name:'RUNTIME_GOVERNANCE',ok:!apiEnabled()||runtimeContract.productionAccessAuthorized===true},
    {name:'NO_SYNTHETIC_FALLBACK_AFTER_REMOTE_AUTH',ok:!apiEnabled()||!!remoteState}
  ]}
}
function transact(mutator){const state=read();const value=mutator(state);write(state);return value===undefined?state:value}
window.MTADeteniStateKernel=Object.freeze({version:'2.0.0',key:KEY,brandingKey:BRANDING_KEY,read,write,persist:persistLocal,transact,audit,uid,now,normalize,initialize,ready:initialize,contractTest,getRuntimeContract:()=>clone(runtimeContract),getSyncState:()=>clone(lastSync)});
void initialize().catch(()=>{});
})();