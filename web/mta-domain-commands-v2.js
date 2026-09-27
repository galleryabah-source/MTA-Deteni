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
window.MTADeteniDomainCommandsV2=Object.freeze({createLeave,roomQrState,issueLeaveQr,revokeLeaveQr});
})();
