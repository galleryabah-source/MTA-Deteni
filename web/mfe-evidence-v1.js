(()=>{'use strict';
const PREFIX='MFE:EVIDENCE:';
const queue=()=>window.MTADeteniOfflineQueue;
const uid=()=>typeof crypto!=='undefined'&&crypto.randomUUID?crypto.randomUUID():'SYNTH-'+Date.now()+'-'+Math.random().toString(16).slice(2);
function normalize(input){
  if(!input||typeof input!=='object')throw new Error('MFE_EVIDENCE_INPUT_REQUIRED');
  const evidenceId=String(input.evidenceId||uid());
  const capturedAt=String(input.capturedAt||new Date().toISOString());
  const actorId=String(input.actorId||'SYNTHETIC-MFE-OPERATOR');
  const eventType=String(input.eventType||'LAINNYA');
  const sourceKind=String(input.sourceKind||'NOTE');
  if(!actorId||!capturedAt)throw new Error('MFE_EVIDENCE_PROVENANCE_REQUIRED');
  return {evidenceId,capturedAt,actorId,eventType,sourceKind,location:input.location?String(input.location):undefined,rawNote:input.rawNote?String(input.rawNote):undefined,photoRefs:Array.isArray(input.photoRefs)?input.photoRefs.map(String):[],includeInReport:input.includeInReport!==false,eventRef:input.eventRef?String(input.eventRef):undefined,sequence:Number.isFinite(input.sequence)?input.sequence:0,syntheticOnly:true};
}
async function capture(input){
  if(!queue()?.put)throw new Error('MFE_OFFLINE_QUEUE_UNAVAILABLE');
  const evidence=normalize(input);
  return queue().put({...evidence,operation:'MFE_EVIDENCE_CAPTURE',idempotencyKey:PREFIX+evidence.evidenceId,correlationId:evidence.evidenceId});
}
async function list(){
  if(!queue()?.all)throw new Error('MFE_OFFLINE_QUEUE_UNAVAILABLE');
  return (await queue().all()).filter(x=>x.operation==='MFE_EVIDENCE_CAPTURE').sort((a,b)=>String(a.capturedAt).localeCompare(String(b.capturedAt))||String(a.evidenceId).localeCompare(String(b.evidenceId)));
}
async function contract(){
  const e=await capture({eventType:'LAINNYA',actorId:'SYNTHETIC-MFE-CONTRACT',rawNote:'MFE contract probe'});
  const rows=await list();
  const ok=rows.filter(x=>x.evidenceId===e.evidenceId).length===1&&e.syntheticOnly===true&&e.operation==='MFE_EVIDENCE_CAPTURE';
  await queue().remove(e.idempotencyKey);
  return {ok,evidenceId:e.evidenceId,syntheticOnly:true};
}
window.MTAFieldEvidence=Object.freeze({capture,list,contract,normalize,storage:'MTA_OFFLINE_QUEUE_V1',syntheticOnly:true});
})();