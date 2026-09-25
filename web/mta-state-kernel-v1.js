(()=>{
'use strict';
if(window.MTADeteniStateKernel)return;
const KEY='mta-deteni-demo-v2';
const BRANDING_KEY='mta-deteni-branding-v1';
const clone=v=>JSON.parse(JSON.stringify(v));
const uid=p=>p+'-'+crypto.randomUUID().slice(0,10).toUpperCase();
const now=()=>new Date().toISOString();
function read(){
  try{
    const raw=localStorage.getItem(KEY);
    const state=raw?JSON.parse(raw):{};
    if(!state||typeof state!=='object')throw new Error('STATE_INVALID');
    for(const k of ['detainees','placements','movements','leaves','documents','audit','rooms','blocks'])if(!Array.isArray(state[k]))state[k]=[];
    try{const b=JSON.parse(localStorage.getItem(BRANDING_KEY)||'null');if(b){state.adminSettings=state.adminSettings||{};state.adminSettings.branding=b}}catch{}
    return state;
  }catch(err){console.error('[MTA] state read failed',err);return {}}
}
function persist(state){
  if(!state||typeof state!=='object')throw new Error('STATE_NOT_OBJECT');
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
function write(state){return persist(state)}
function audit(state,action,resourceType,resourceId,result='SUCCESS',meta={}){
  state.audit=Array.isArray(state.audit)?state.audit:[];
  const event={id:uid('AUD'),action,resourceType,resourceId:resourceId||'',result,occurredAt:now(),actor:meta.actor||'DEMO-OPERATOR',requestId:meta.requestId||uid('REQ'),correlationId:meta.correlationId||uid('COR'),policyVersion:meta.policyVersion||'AUTHZ-1.0'};
  state.audit.unshift(event);
  return event;
}
function transact(mutator){
  const state=read();
  const value=mutator(state);
  write(state);
  return value===undefined?state:value;
}
window.MTADeteniStateKernel=Object.freeze({version:'1.0.0',key:KEY,brandingKey:BRANDING_KEY,read,write,persist,transact,audit,uid,now});
})();