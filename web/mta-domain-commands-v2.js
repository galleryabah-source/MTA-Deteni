(()=>{
'use strict';
if(window.MTADeteniDomainCommandsV2)return;
const K=()=>window.MTADeteniStateKernel;
const now=()=>new Date().toISOString();
const uid=p=>p+'-'+crypto.randomUUID().slice(0,10).toUpperCase();
const audit=(s,action,type,id,result='SUCCESS',correlationId)=>{
  if(K()?.audit)return K().audit(s,action,type,id,result,{actor:'DEMO-OPERATOR',correlationId});
  s.audit=Array.isArray(s.audit)?s.audit:[];
  s.audit.unshift({id:uid('AUD'),action,resourceType:type,resourceId:id||'',result,occurredAt:now(),actor:'DEMO-OPERATOR',requestId:uid('REQ'),correlationId:correlationId||uid('COR'),policyVersion:'AUTHZ-1.0'});
};
function createLeave(s,o={}){
  const d=s||{}, detaineeId=String(o.detaineeId||''), destination=String(o.destination||'').trim(), startAt=new Date(String(o.startAt||''));
  if(!detaineeId||!destination||Number.isNaN(startAt.getTime()))return{ok:false,code:'LEAVE_INPUT_INVALID'};
  const det=(d.detainees||[]).find(x=>x.id===detaineeId);
  if(!det||det.status!=='AKTIF')return{ok:false,code:'DETAINEE_INACTIVE'};
  const requestKey=String(o.requestKey||('LEAVE_CREATE:'+detaineeId+':'+destination+':'+startAt.toISOString()));
  const existing=(d.leaves||[]).find(x=>x.requestKey===requestKey);
  if(existing)return{ok:true,code:'LEAVE_ALREADY_PROCESSED',leave:existing,correlationId:existing.correlationId};
  const correlationId=String(o.correlationId||'COR-'+crypto.randomUUID().slice(0,8).toUpperCase());
  const leave={id:o.id||uid('LV'),detaineeId,destination,purpose:String(o.purpose||''),startAt:startAt.toISOString(),status:'DRAFT',createdAt:now(),requestKey,correlationId};
  d.leaves=Array.isArray(d.leaves)?d.leaves:[];
  d.leaves.unshift(leave);
  d.lastMutation={key:requestKey,action:'LEAVE_CREATE',completedAt:now()};
  audit(d,'LEAVE_CREATE','LEAVE',leave.id,'SUCCESS',correlationId);
  return{ok:true,code:'LEAVE_CREATED',leave,correlationId};
}
function roomQrState(s,id,nextState){
  const d=s||{}, x=(d.rooms||[]).find(z=>z.id===id);
  if(!x)return{ok:false,code:'ROOM_NOT_FOUND'};
  d.qr=d.qr||{detainee:{},room:{},leave:{}};
  d.qr.room=d.qr.room||{};
  const q=d.qr.room[id]||(d.qr.room[id]={token:uid('RMQR'),status:x.status==='ACTIVE'?'ACTIVE':'SUSPENDED'});
  const next=nextState||({ACTIVE:'SUSPENDED',SUSPENDED:'REVOKED',REVOKED:'ACTIVE'}[q.status]||'ACTIVE');
  if(!['ACTIVE','SUSPENDED','REVOKED'].includes(next))return{ok:false,code:'QR_STATE_INVALID'};
  q.status=next;
  const correlationId=uid('COR');
  d.lastMutation={key:'QR_ROOM_STATE:'+id+':'+next,action:'QR_ROOM_STATE_CHANGE',completedAt:now()};
  audit(d,'QR_ROOM_STATE_CHANGE','ROOM_QR',id,'SUCCESS',correlationId);
  return{ok:true,code:'ROOM_QR_STATE_CHANGED',room:x,qr:q,correlationId};
}
function issueLeaveQr(s,id){
  const d=s||{}, l=(d.leaves||[]).find(x=>x.id===id);
  if(!l)return{ok:false,code:'LEAVE_NOT_FOUND'};
  if(!['APPROVED','DEPARTED'].includes(l.status))return{ok:false,code:'LEAVE_QR_GATE_DENIED'};
  d.qr=d.qr||{detainee:{},room:{},leave:{}};
  d.qr.leave=d.qr.leave||{};
  const q={token:uid('LVQR'),status:'ACTIVE',issuedAt:now(),expiresAt:null};
  d.qr.leave[id]=q;
  const correlationId=l.correlationId||uid('COR');
  d.lastMutation={key:'LEAVE_QR_ISSUE:'+id,action:'LEAVE_QR_ISSUE',completedAt:now()};
  audit(d,'LEAVE_QR_ISSUE','LEAVE_QR',id,'SUCCESS',correlationId);
  return{ok:true,code:'LEAVE_QR_ISSUED',qr:q,correlationId};
}
function revokeLeaveQr(s,id){
  const d=s||{};d.qr=d.qr||{detainee:{},room:{},leave:{}};d.qr.leave=d.qr.leave||{};
  const q=d.qr.leave[id];
  if(!q)return{ok:false,code:'LEAVE_QR_NOT_FOUND'};
  q.status='REVOKED';
  const correlationId=uid('COR');
  d.lastMutation={key:'LEAVE_QR_REVOKE:'+id,action:'LEAVE_QR_REVOKE',completedAt:now()};
  audit(d,'LEAVE_QR_REVOKE','LEAVE_QR',id,'SUCCESS',correlationId);
  return{ok:true,code:'LEAVE_QR_REVOKED',qr:q,correlationId};
}
function updateSystem(s,o={}){const d=s||{};d.adminSettings=d.adminSettings||{};if(o.facilityName!==undefined)d.adminSettings.facilityName=String(o.facilityName).trim();if(o.timezone!==undefined)d.adminSettings.timezone=String(o.timezone);const id='ADMIN';const correlationId=uid('COR');d.lastMutation={key:'ADMIN_SETTINGS_UPDATE:SYSTEM',action:'ADMIN_SETTINGS_UPDATE',completedAt:now()};audit(d,'ADMIN_SETTINGS_UPDATE','SYSTEM',id,'SUCCESS',correlationId);return{ok:true,code:'ADMIN_SYSTEM_UPDATED',correlationId}}
function updateAi(s,o={}){const d=s||{};d.adminSettings=d.adminSettings||{};d.adminSettings.aiSettings={provider:String(o.provider||'Gemini'),endpoint:String(o.endpoint||''),model:String(o.model||''),secretConfigured:!!String(o.apiKey||o.secretConfigured||'').trim(),enabled:false};const correlationId=uid('COR');d.lastMutation={key:'ADMIN_AI_API_CONFIG_UPDATE',action:'ADMIN_AI_API_CONFIG_UPDATE',completedAt:now()};audit(d,'ADMIN_AI_API_CONFIG_UPDATE','AI_CONFIG','ADMIN','SUCCESS',correlationId);return{ok:true,code:'ADMIN_AI_UPDATED',correlationId}}
function updateBranding(s,o={}){const d=s||{};d.adminSettings=d.adminSettings||{};d.adminSettings.branding=d.adminSettings.branding||{};for(const k of ['title','subtitle'])if(o[k]!==undefined)d.adminSettings.branding[k]=String(o[k]).trim();const correlationId=uid('COR');d.lastMutation={key:'ADMIN_WEB_DESIGN_UPDATE',action:'ADMIN_WEB_DESIGN_UPDATE',completedAt:now()};audit(d,'ADMIN_WEB_DESIGN_UPDATE','WEB_BRANDING','ADMIN','SUCCESS',correlationId);return{ok:true,code:'ADMIN_BRANDING_UPDATED',correlationId}}
function uploadBranding(s,o={}){const d=s||{};d.adminSettings=d.adminSettings||{};d.adminSettings.branding=d.adminSettings.branding||{};const key=o.kind==='icon'?'iconData':o.kind==='logo'?'logoData':'headerData';d.adminSettings.branding[key]=String(o.data||'');const correlationId=uid('COR');d.lastMutation={key:'ADMIN_WEB_ASSET_UPLOAD:'+o.kind,action:'ADMIN_WEB_ASSET_UPLOAD',completedAt:now()};audit(d,'ADMIN_WEB_ASSET_UPLOAD','WEB_BRANDING_'+String(o.kind||'').toUpperCase(),'ADMIN','SUCCESS',correlationId);return{ok:true,code:'ADMIN_BRANDING_ASSET_UPDATED',correlationId}}
function catalogCreate(s,key,value){const d=s||{};d.adminCatalogs=d.adminCatalogs||{};d.adminCatalogs[key]=Array.isArray(d.adminCatalogs[key])?d.adminCatalogs[key]:[];const v=String(value||'').trim();if(!v)return{ok:false,code:'CATALOG_VALUE_REQUIRED'};if(d.adminCatalogs[key].some(x=>String(x).toLowerCase()===v.toLowerCase()))return{ok:false,code:'CATALOG_DUPLICATE'};d.adminCatalogs[key].push(v);const correlationId=uid('COR');d.lastMutation={key:'MASTER_CATALOG_CREATE:'+key+':'+v,action:'MASTER_CATALOG_CREATE',completedAt:now()};audit(d,'MASTER_CATALOG_CREATE','ADMIN_CATALOG',key,'SUCCESS',correlationId);return{ok:true,code:'CATALOG_CREATED',correlationId}}
function catalogRemove(s,key,index){const d=s||{},arr=d.adminCatalogs?.[key];if(!Array.isArray(arr)||!arr[index])return{ok:false,code:'CATALOG_NOT_FOUND'};arr.splice(index,1);const correlationId=uid('COR');d.lastMutation={key:'MASTER_CATALOG_DEACTIVATE:'+key,action:'MASTER_CATALOG_DEACTIVATE',completedAt:now()};audit(d,'MASTER_CATALOG_DEACTIVATE','ADMIN_CATALOG',key,'SUCCESS',correlationId);return{ok:true,code:'CATALOG_REMOVED',correlationId}}
function createBlock(s,o={}){const d=s||{};d.blocks=Array.isArray(d.blocks)?d.blocks:[];const name=String(o.name||'').trim();if(!name)return{ok:false,code:'BLOCK_NAME_REQUIRED'};if(d.blocks.some(b=>String(b.name).toLowerCase()===name.toLowerCase()))return{ok:false,code:'BLOCK_DUPLICATE'};const b={id:o.id||uid('BLK'),name,status:String(o.status||'ACTIVE'),createdAt:now(),source:'ADMIN_MASTER'};d.blocks.push(b);const correlationId=uid('COR');d.lastMutation={key:'BLOCK_CREATE:'+b.id,action:'BLOCK_CREATE',completedAt:now()};audit(d,'BLOCK_CREATE','BLOCK',b.id,'SUCCESS',correlationId);return{ok:true,code:'BLOCK_CREATED',block:b,correlationId}}
function updateBlock(s,id,o={}){const d=s||{},b=(d.blocks||[]).find(x=>x.id===id),name=String(o.name||'').trim();if(!b||!name)return{ok:false,code:'BLOCK_NOT_FOUND'};if((d.blocks||[]).some(x=>x.id!==id&&String(x.name).toLowerCase()===name.toLowerCase()))return{ok:false,code:'BLOCK_DUPLICATE'};b.name=name;b.status=String(o.status||b.status||'ACTIVE');(d.rooms||[]).filter(r=>r.blockId===id).forEach(r=>r.block=name);const correlationId=uid('COR');d.lastMutation={key:'BLOCK_UPDATE:'+id,action:'BLOCK_UPDATE',completedAt:now()};audit(d,'BLOCK_UPDATE','BLOCK',id,'SUCCESS',correlationId);return{ok:true,code:'BLOCK_UPDATED',block:b,correlationId}}
function createRoom(s,o={}){const d=s||{};d.rooms=Array.isArray(d.rooms)?d.rooms:[];d.qr=d.qr||{detainee:{},room:{},leave:{}};d.qr.room=d.qr.room||{};const b=(d.blocks||[]).find(x=>x.id===o.blockId);const room=String(o.room||'').trim();if(!b||!room)return{ok:false,code:'ROOM_INPUT_INVALID'};if(d.rooms.some(r=>r.blockId===b.id&&String(r.room).toLowerCase()===room.toLowerCase()))return{ok:false,code:'ROOM_DUPLICATE'};const id=o.id||uid('ROOM');const r={id,blockId:b.id,block:b.name,room,capacity:Number(o.capacity)||1,type:String(o.type||'STANDARD'),gender:String(o.gender||'UMUM'),status:String(o.status||'ACTIVE'),note:String(o.note||''),createdAt:now(),source:'ADMIN_MASTER',version:1};d.rooms.push(r);d.qr.room[id]={token:uid('RMQR'),status:r.status==='ACTIVE'?'ACTIVE':'SUSPENDED'};const correlationId=uid('COR');d.lastMutation={key:'ROOM_CREATE:'+id,action:'ROOM_CREATE',completedAt:now()};audit(d,'ROOM_CREATE','ROOM',id,'SUCCESS',correlationId);return{ok:true,code:'ROOM_CREATED',room:r,correlationId}}
function updateRoom(s,id,o={}){const d=s||{},r=(d.rooms||[]).find(x=>x.id===id),b=(d.blocks||[]).find(x=>x.id===o.blockId),room=String(o.room||'').trim();if(!r||!b||!room)return{ok:false,code:'ROOM_INPUT_INVALID'};if((d.rooms||[]).some(x=>x.id!==id&&x.blockId===b.id&&String(x.room).toLowerCase()===room.toLowerCase()))return{ok:false,code:'ROOM_DUPLICATE'};const occ=(d.detainees||[]).filter(x=>x.status==='AKTIF').filter(x=>{const p=(d.placements||[]).filter(q=>q.detaineeId===x.id).sort((a,z)=>String(z.since||'').localeCompare(String(a.since||'')))[0];return p&&(p.roomId===id||(!p.roomId&&p.block===r.block&&p.room===r.room))}).length;const capacity=Number(o.capacity)||1,status=String(o.status||'ACTIVE');if(capacity<occ)return{ok:false,code:'ROOM_CAPACITY_BELOW_OCCUPANCY'};if(status!=='ACTIVE'&&occ>0)return{ok:false,code:'ROOM_OCCUPIED'};Object.assign(r,{blockId:b.id,block:b.name,room,capacity,type:String(o.type||r.type||'STANDARD'),gender:String(o.gender||r.gender||'UMUM'),status,note:String(o.note??r.note??''),version:(r.version||1)+1});d.qr=d.qr||{detainee:{},room:{},leave:{}};d.qr.room=d.qr.room||{};d.qr.room[id]=d.qr.room[id]||{token:uid('RMQR'),status:'ACTIVE'};d.qr.room[id].status=status==='ACTIVE'?'ACTIVE':'SUSPENDED';const correlationId=uid('COR');d.lastMutation={key:'ROOM_UPDATE:'+id,action:'ROOM_UPDATE',completedAt:now()};audit(d,'ROOM_UPDATE','ROOM',id,'SUCCESS',correlationId);return{ok:true,code:'ROOM_UPDATED',room:r,correlationId}}
function createDocument(s,document){const d=s||{};d.documents=Array.isArray(d.documents)?d.documents:[];if(!document||!document.documentId)return{ok:false,code:'DOCUMENT_INPUT_INVALID'};if(d.documents.some(x=>(x.documentId||x.id)===document.documentId))return{ok:false,code:'DOCUMENT_DUPLICATE'};d.documents.unshift(document);const correlationId=document.correlationId||uid('COR');d.lastMutation={key:'DOCUMENT_DRAFT_CREATE:'+document.documentId,action:'DOCUMENT_DRAFT_CREATE',completedAt:now()};audit(d,'DOCUMENT_DRAFT_CREATE','DOCUMENT',document.documentId,'SUCCESS',correlationId);return{ok:true,code:'DOCUMENT_CREATED',document,correlationId}}
function transitionDocument(s,id,next,note){const d=s||{},r=(d.documents||[]).find(x=>(x.documentId||x.id)===id);if(!r)return{ok:false,code:'DOCUMENT_NOT_FOUND'};try{window.mtaDailyGuardReport?.transitionStatus(r,next)}catch(e){return{ok:false,code:e?.message||'DOCUMENT_TRANSITION_FAILED'}}const ts=now(),map={IN_REVIEW:'reviewStartedAt',APPROVED:'approvedAt',CHANGES_REQUESTED:'changesRequestedAt',FINAL:'finalizedAt'};if(map[next])r[map[next]]=ts;if(note){if(next==='IN_REVIEW')r.reviewerNote=note;if(next==='APPROVED')r.approvalNote=note;if(next==='CHANGES_REQUESTED')r.changeRequestNote=note}const correlationId=r.correlationId||uid('COR');r.correlationId=correlationId;d.lastMutation={key:'DOCUMENT_STATUS:'+id+':'+next,action:'DOCUMENT_'+next,completedAt:ts};audit(d,'DOCUMENT_'+next,'DOCUMENT',id,'SUCCESS',correlationId);return{ok:true,code:'DOCUMENT_TRANSITIONED',document:r,correlationId}}
function applyGeneratedDocument(s,id,prepared){const d=s||{},r=(d.documents||[]).find(x=>(x.documentId||x.id)===id);if(!r)return{ok:false,code:'DOCUMENT_NOT_FOUND'};if(r.status!=='VALIDATED')return{ok:false,code:'REPORT_NOT_VALIDATED'};if(!prepared||typeof prepared!=='object')return{ok:false,code:'DOCUMENT_PREPARE_INVALID'};for(const [k,v] of Object.entries(prepared)){if(k==='status'||k==='documentId'||k==='id')continue;r[k]=structuredClone(v)}r.status='GENERATED';r.generatedAt=r.generatedAt||now();const correlationId=r.correlationId||uid('COR');r.correlationId=correlationId;d.lastMutation={key:'DOCUMENT_GENERATE:'+id,action:'DOCUMENT_GENERATE',completedAt:now()};audit(d,'DOCUMENT_GENERATE','DOCUMENT',id,'SUCCESS',correlationId);return{ok:true,code:'DOCUMENT_GENERATED',document:r,correlationId}}
function createDocumentRevision(s,id){const d=s||{},source=(d.documents||[]).find(x=>(x.documentId||x.id)===id);if(!source)return{ok:false,code:'DOCUMENT_NOT_FOUND'};if(source.status!=='CHANGES_REQUESTED')return{ok:false,code:'REPORT_NOT_IN_CHANGES_REQUESTED'};const revision=structuredClone(source),newId=uid('RPT');revision.documentId=newId;delete revision.id;revision.status='DRAFT';revision.revision=Number(source.revision||1)+1;revision.revisionOf=source.documentId||source.id;revision.createdAt=now();delete revision.integrityHash;delete revision.filename;delete revision.generatedAt;delete revision.finalizedAt;delete revision.approvedAt;delete revision.approvalNote;delete revision.reviewStartedAt;delete revision.reviewerNote;revision.revisionCreatedAt=now();d.documents.unshift(revision);const correlationId=revision.correlationId||uid('COR');revision.correlationId=correlationId;d.lastMutation={key:'DOCUMENT_REVISION_CREATE:'+newId,action:'DOCUMENT_REVISION_CREATE',completedAt:now()};audit(d,'DOCUMENT_REVISION_CREATE','DOCUMENT',newId,'SUCCESS',correlationId);return{ok:true,code:'DOCUMENT_REVISION_CREATED',document:revision,correlationId}}
function restoreBackup(s,x){if(!x||typeof x!=='object')return{ok:false,code:'BACKUP_INVALID'};const roots=['detainees','placements','movements','leaves','documents','audit','rooms','blocks'];if(!roots.every(k=>Array.isArray(x[k])))return{ok:false,code:'BACKUP_ROOT_INVALID'};if(x.audit.some(a=>!a?.id||!a?.action||!a?.resourceType||!a?.occurredAt))return{ok:false,code:'BACKUP_AUDIT_INVALID'};const restored=structuredClone(x);const correlationId=uid('COR');restored.lastMutation={key:'BACKUP_RESTORE:'+now(),action:'BACKUP_RESTORE',completedAt:now()};audit(restored,'BACKUP_RESTORE','BACKUP','synthetic','SUCCESS',correlationId);return{ok:true,code:'BACKUP_RESTORED',state:restored,correlationId}}
window.MTADeteniDomainCommandsV2=Object.freeze({createLeave,roomQrState,issueLeaveQr,revokeLeaveQr,updateSystem,updateAi,updateBranding,uploadBranding,catalogCreate,catalogRemove,createBlock,updateBlock,createRoom,updateRoom,createDocument,transitionDocument,applyGeneratedDocument,createDocumentRevision,restoreBackup});
})();
