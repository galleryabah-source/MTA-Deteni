import crypto from 'node:crypto';
export const COMMAND_EVIDENCE_VERSION='P10.445-452-v1';
export function createCommandEvidence(input){
 for(const k of ['requestId','correlationId','command','planFingerprint','authorizationDecision','transactionId'])if(typeof input[k]!=='string'||!input[k])throw new Error('COMMAND_EVIDENCE_FIELD_REQUIRED:'+k);
 const payload={version:COMMAND_EVIDENCE_VERSION,...input,productionMutation:false,externalTransport:false};
 return Object.freeze({...payload,evidenceFingerprint:crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex')});
}