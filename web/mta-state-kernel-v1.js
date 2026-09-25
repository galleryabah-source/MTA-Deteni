(()=>{
'use strict';
if(window.MTADeteniStateKernel)return;
const KEY='mta-deteni-demo-v2';
const BRANDING_KEY='mta-deteni-branding-v1';
const clone=v=>JSON.parse(JSON.stringify(v));
const uid=p=>p+'-'+crypto.randomUUID().slice(0,10).toUpperCase();
const now=()=>new Date().toISOString();
function normalize(state){
  if(!state||typeof state!=='object')throw new Error('STATE_INVALID');
  for(const k of ['detainees','placements','movements','leaves','documents','audit','rooms','blocks'])if(!Array.isArray(state[k]))state[k]=[];
  state.qr=state.qr&&typeof state.qr==='object'?state.qr:{detainee:{},room:{},leave:{}};
  state.qr.detainee=state.qr.detainee&&typeof state.qr.detainee==='object'?state.qr.detainee:{};
  state.qr.room=state.qr.room&&typeof state.qr.room==='object'?state.qr.room:{};
  state.qr.leave=state.qr.leave&&typeof state.qr.leave==='object'?state.qr.leave:{};
  // Legacy synthetic states created before Master Room became authoritative are
  // normalized in-memory; this is compatibility normalization, not a DB migration.
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
  const roomByLabel=new Map(state.rooms.map(r=>[String(r.block||'')+' / '+String(r.room||''),r]));
  state.placements.forEach(p=>{
    if(!p?.roomId){
      const r=roomByLabel.get(String(p?.block||'')+' / '+String(p?.room||''));
      if(r){p.roomId=r.id;p.blockId=p.blockId||r.blockId;p.source=p.source||'LEGACY_NORMALIZED'}
    }
  });
  return state;
}
function read(){
  try{
    const raw=localStorage.getItem(KEY);
    const state=normalize(raw?JSON.parse(raw):{});
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
function contractTest(){
  const probeKey='__mta_state_kernel_probe__';
  const state=read();
  const copy=normalize(clone(state));
  if(copy.adminSettings)delete copy.adminSettings.branding;
  const serialized=JSON.stringify(copy);
  let roundTrip=false,probeError='';
  try{
    localStorage.setItem(probeKey,serialized);
    roundTrip=localStorage.getItem(probeKey)===serialized;
  }catch(err){probeError=err?.message||'PROBE_FAILED'}
  finally{try{localStorage.removeItem(probeKey)}catch{}}
  const auditShape=typeof audit==='function'&&audit(copy,'KERNEL_CONTRACT_PROBE','SYSTEM','PROBE')?.correlationId;
  return {ok:roundTrip&&!!auditShape,checks:[
    {name:'KERNEL_READ',ok:typeof read==='function'},
    {name:'KERNEL_WRITE',ok:typeof write==='function'},
    {name:'KERNEL_NORMALIZE',ok:Array.isArray(copy.rooms)&&Array.isArray(copy.blocks)},
    {name:'KERNEL_SERIALIZATION_READBACK',ok:roundTrip,detail:probeError},
    {name:'KERNEL_CANONICAL_AUDIT',ok:!!auditShape}
  ]};
}
function transact(mutator){
  const state=read();
  const value=mutator(state);
  write(state);
  return value===undefined?state:value;
}
window.MTADeteniStateKernel=Object.freeze({version:'1.2.0',key:KEY,brandingKey:BRANDING_KEY,read,write,persist,transact,audit,uid,now,contractTest});
})();