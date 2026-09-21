import crypto from 'node:crypto';
export const DECISION_AUDIT_BOUNDARY_VERSION='P10.421-428-v1';
export function recordGovernedDecisionBoundary(input){
 for(const k of ['decisionId','decisionOutcome','actorId','releaseControlFingerprint'])if(typeof input[k]!=='string'||!input[k].trim())throw new Error('DECISION_AUDIT_FIELD_REQUIRED:'+k);
 if(!['APPROVED','REJECTED','CHANGES_REQUESTED'].includes(input.decisionOutcome))throw new Error('DECISION_OUTCOME_INVALID');
 const payload={version:DECISION_AUDIT_BOUNDARY_VERSION,decisionId:input.decisionId,decisionOutcome:input.decisionOutcome,actorId:input.actorId,releaseControlFingerprint:input.releaseControlFingerprint,occurredAt:input.occurredAt||null};
 return Object.freeze({...payload,eventFingerprint:crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex'),executionAuthorized:false,productionMutation:false});
}