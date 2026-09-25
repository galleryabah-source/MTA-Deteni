(()=>{
'use strict';
if(window.__mtaSystemAuditInstalled)return;
window.__mtaSystemAuditInstalled=true;
function check(name,ok,detail){return {name,ok:!!ok,detail:detail||''}}
function run(){
  const results=[];
  const k=window.MTADeteniStateKernel;
  results.push(check('STATE_KERNEL_AVAILABLE',!!k));
  if(k){
    const c=k.contractTest();results.push(...(c.checks||[]).map(x=>check(x.name,x.ok)));
  }
  results.push(check('UNIFIED_NAVIGATION_OWNER',typeof window.show==='function'&&typeof window.__mtaUnifiedOriginalShow==='function'));
  results.push(check('PREVIEW_V5_VIEW_ADAPTER',!!window.MTAPreviewV5Views?.render));
  results.push(check('PREVIEW_V6_VIEW_ADAPTER',!!window.MTAPreviewV6Views?.render));
  results.push(check('MOVEMENT_VIEW_ADAPTER',!!window.MTAMovementView?.render));
  results.push(check('ROOM_OPS_VIEW_ADAPTER',!!window.MTARoomOpsView?.render));
  results.push(check('MASTER_ROOM_GUARD',!!window.MTA_DETENI_MASTER_ROOM_GUARD?.validateDetaineeRoom));
  results.push(check('DETAINEE_CRUD_OWNER',typeof window.addDetainee==='function'&&typeof window.editDetainee==='function'));
  const state=k?.read?.()||{};
  results.push(check('STATE_ARRAYS',['detainees','placements','movements','leaves','documents','audit','rooms','blocks'].every(x=>Array.isArray(state[x]))));
  results.push(check('AI_SECRET_NOT_PERSISTED',!state.adminSettings?.aiSettings?.apiKey));
  results.push(check('AI_RUNTIME_OFF',state.adminSettings?.ai==='OFF'||state.adminSettings?.aiSettings?.enabled!==true));
  results.push(check('SCHEMA_MIGRATION_FROZEN',state.adminSettings?.migrationFreeze!==false));
  if(typeof window.mtaUnifiedFinalIntegrityGate==='function'){
    const gate=window.mtaUnifiedFinalIntegrityGate();results.push(check('FINAL_INTEGRITY_GATE',gate?.ok,gate?.status));
  }else results.push(check('FINAL_INTEGRITY_GATE',false,'GATE_UNAVAILABLE'));
  return {status:results.every(x=>x.ok)?'PASS':'FAIL',checkedAt:new Date().toISOString(),checks:results};
}
window.mtaSystemAudit=run;
})();