import { createHash } from 'node:crypto';
const SCHEMA='MTA-GOVERNED-EXECUTION-DECISION-V1';
const req=(v,n)=>{if(typeof v!=='string'||!v.trim())throw new Error(`${n}_REQUIRED`);return v.trim();};
const sref=(v,n)=>{const x=req(v,n);if(!/^synthetic:[A-Za-z0-9._:-]+$/.test(x))throw new Error(`${n}_MUST_BE_SYNTHETIC_REF`);return x;};
const hash=(v)=>createHash('sha256').update(JSON.stringify(v)).digest('hex');
export function buildGovernedExecutionDecision({decisionId,packetId,decision='PENDING',approverRef=null,scopeRef=null,reason=null}={}){
 req(decisionId,'DECISION_ID'); req(packetId,'PACKET_ID');
 if(approverRef!==null)sref(approverRef,'APPROVER_REF'); if(scopeRef!==null)sref(scopeRef,'SCOPE_REF');
 if(reason!==null)req(reason,'DECISION_REASON');
 if(!['PENDING','APPROVED','REJECTED'].includes(decision))throw new Error('DECISION_INVALID');
 const payload={schemaVersion:SCHEMA,decisionId:sref(decisionId,'DECISION_ID'),packetId:sref(packetId,'PACKET_ID'),decision,approverRef:approverRef? sref(approverRef,'APPROVER_REF'):null,scopeRef:scopeRef? sref(scopeRef,'SCOPE_REF'):null,reason,safety:{syntheticOnly:true,migrationFreeze:true,aiEnabled:false}};
 return Object.freeze({...payload,decisionSha256:hash(payload)});
}
export function assertGovernedExecutionDecision(d){
 if(!d||d.schemaVersion!==SCHEMA)throw new Error('DECISION_SCHEMA_INVALID'); sref(d.decisionId,'DECISION_ID');sref(d.packetId,'PACKET_ID');
 if(d.safety?.syntheticOnly!==true||d.safety?.migrationFreeze!==true||d.safety?.aiEnabled!==false)throw new Error('DECISION_SAFETY_INVALID');
 if(d.decision==='APPROVED'){sref(d.approverRef,'APPROVER_REF');sref(d.scopeRef,'SCOPE_REF');req(d.reason,'DECISION_REASON');}
 const {decisionSha256,...payload}=d;if(hash(payload)!==decisionSha256)throw new Error('DECISION_TAMPERED');
 return true;
}
export function classifyGovernedExecutionDecision(d){try{assertGovernedExecutionDecision(d);return Object.freeze({classification:d.decision==='APPROVED'?'PASS':d.decision==='REJECTED'?'FAIL':'BLOCKED',executionAuthorized:false});}catch(e){return Object.freeze({classification:'BLOCKED',executionAuthorized:false,reason:e instanceof Error?e.message:'DECISION_BLOCKED'});}}
export {SCHEMA};
