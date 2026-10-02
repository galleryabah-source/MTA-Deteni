(()=>{
'use strict';
if(window.MTADeteniDomainCommands)return;
const now=()=>new Date().toISOString();
const uid=p=>p+'-'+crypto.randomUUID().slice(0,10).toUpperCase();
function audit(state,action,type,id,result='SUCCESS',correlationId){
  const kernel=window.MTADeteniStateKernel;
  if(kernel?.audit)return kernel.audit(state,action,type,id,result,{actor:'DEMO-OPERATOR',correlationId:correlationId||uid('COR')});
  throw new Error('CANONICAL_AUDIT_KERNEL_REQUIRED');
}
async function createDetainee(state,options={}){
  if(Object.prototype.hasOwnProperty.call(options,'nid'))return{ok:false,code:'NID_SYSTEM_GENERATED'};
  const entryYear=Number(options.entryYear);
  if(!Number.isInteger(entryYear)||entryYear<2000||entryYear>2099)return{ok:false,code:'ENTRY_YEAR_REQUIRED'};
  const d=state||{},code=String(options.code||'').trim(),name=String(options.name||'').trim(),nationality=String(options.nationality||'').trim(),gender=String(options.gender||'').trim(),dateOfBirth=String(options.dateOfBirth||'').trim(),passportNumber=String(options.passportNumber||'').trim(),notes=String(options.notes||'').trim(),status=String(options.status||'AKTIF'),roomId=String(options.roomId||'');
  if(!code||!name)return{ok:false,code:'DETAINEE_INPUT_INVALID'};
  d.detainees=Array.isArray(d.detainees)?d.detainees:[];
  if(d.detainees.some(x=>String(x.code||'').trim().toLowerCase()===code.toLowerCase()))return{ok:false,code:'DETAINEE_CODE_EXISTS'};
  const room=roomId?(d.rooms||[]).find(x=>x.id===roomId&&x.status==='ACTIVE'):null;
  if(status==='AKTIF'&&!room)return{ok:false,code:'INITIAL_PLACEMENT_REQUIRED'};
  if(room&&typeof window.MTA_DETENI_MASTER_ROOM_GUARD?.validateDetaineeRoom==='function'){
    const guard=window.MTA_DETENI_MASTER_ROOM_GUARD.validateDetaineeRoom(d,room.id,null);
    if(guard&&!guard.ok)return{ok:false,code:guard.code||'ROOM_INVALID'};
  }
  const id=options.id||uid('DET'),correlationId=options.correlationId||uid('COR');
  const detainee={id,code,name,nationality,entryYear,gender,dateOfBirth,passportNumber,notes,status,placement:room?room.block+' / '+room.room:'',createdAt:options.createdAt||now(),correlationId};
  d.detainees.unshift(detainee);
  audit(d,'DETAINEE_CREATE','DETAINEE',id,'SUCCESS',correlationId);
  if(room){
    if(typeof window.MTADeteniDomainCommandsV2?.assignPlacement!=='function')return{ok:false,code:'CANONICAL_PLACEMENT_NOT_READY'};
    const placement=await window.MTADeteniDomainCommandsV2.assignPlacement(d,{detaineeId:id,roomId:room.id,since:detainee.createdAt,source:'MASTER_ROOM',requestKey:'PLACEMENT:'+id+':'+room.id,correlationId});
    if(!placement.ok){d.detainees=d.detainees.filter(x=>x.id!==id);d.audit=d.audit.filter(x=>x.resourceId!==id);return{ok:false,code:placement.code,correlationId}}
  }
  d.lastMutation={key:'DETAINEE_CREATE:'+id,action:'DETAINEE_CREATE',completedAt:now()};
  return{ok:true,code:'DETAINEE_CREATED',detainee,correlationId};
}
function updateDetainee(state,options={}){
  if(Object.prototype.hasOwnProperty.call(options,'nid'))return{ok:false,code:'NID_IMMUTABLE'};
  if(Object.prototype.hasOwnProperty.call(options,'entryYear'))return{ok:false,code:'ENTRY_YEAR_IMMUTABLE'};
  const d=state||{},id=String(options.id||''),x=(d.detainees||[]).find(v=>v.id===id);
  if(!x)return{ok:false,code:'DETAINEE_NOT_FOUND'};
  if(Object.prototype.hasOwnProperty.call(options,'code') && String(options.code??'').trim()!==String(x.code||'').trim())return{ok:false,code:'DETAINEE_CODE_IMMUTABLE'};
  const code=String(x.code||'').trim(),name=String(options.name??x.name).trim(),nationality=String(options.nationality??x.nationality).trim(),gender=String(options.gender??x.gender??'').trim(),dateOfBirth=String(options.dateOfBirth??x.dateOfBirth??'').trim(),passportNumber=String(options.passportNumber??x.passportNumber??'').trim(),notes=String(options.notes??x.notes??'').trim(),status=String(options.status??x.status);
  if(!code||!name)return{ok:false,code:'DETAINEE_INPUT_INVALID'};
  if(status==='AKTIF'){
    const placement=(d.placements||[]).filter(p=>p.detaineeId===id).sort((a,b)=>String(b.since||'').localeCompare(String(a.since||'')))[0];
    if(!placement)return{ok:false,code:'PLACEMENT_REQUIRED'};
  }
  Object.assign(x,{name,nationality,gender,dateOfBirth,passportNumber,notes,status,updatedAt:now()});
  const correlationId=options.correlationId||x.correlationId||uid('COR');x.correlationId=correlationId;
  audit(d,'DETAINEE_UPDATE','DETAINEE',id,'SUCCESS',correlationId);
  d.lastMutation={key:'DETAINEE_UPDATE:'+id+':'+x.updatedAt,action:'DETAINEE_UPDATE',completedAt:now()};
  return{ok:true,code:'DETAINEE_UPDATED',detainee:x,correlationId};
}
function archiveDetainee(state,id,options={}){
  const d=state||{},x=(d.detainees||[]).find(v=>v.id===String(id||''));
  if(!x)return{ok:false,code:'DETAINEE_NOT_FOUND'};
  if(x.status==='NONAKTIF')return{ok:true,code:'DETAINEE_ALREADY_ARCHIVED',detainee:x};
  const correlationId=options.correlationId||uid('COR');
  x.status='NONAKTIF';x.updatedAt=now();
  if(d.qr?.detainee?.[x.id])d.qr.detainee[x.id].status='SUSPENDED';
  audit(d,'DETAINEE_ARCHIVE','DETAINEE',x.id,'SUCCESS',correlationId);
  d.lastMutation={key:'DETAINEE_ARCHIVE:'+x.id,action:'DETAINEE_ARCHIVE',completedAt:now()};
  return{ok:true,code:'DETAINEE_ARCHIVED',detainee:x,correlationId};
}
window.MTADeteniDomainCommands=Object.freeze({createDetainee,updateDetainee,archiveDetainee});
})();