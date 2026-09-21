import crypto from 'node:crypto';
export const OUTBOX_RUNTIME_VERSION='P9.8-IMPLEMENTATION-v1';
export function createOutboxEvent(input){
 for(const k of ['eventId','aggregateType','aggregateId','eventType','payloadHash','occurredAt'])if(typeof input[k]!=='string'||!input[k])throw new Error('OUTBOX_FIELD_REQUIRED:'+k);
 if(!/^[a-f0-9]{64}$/.test(input.payloadHash))throw new Error('OUTBOX_PAYLOAD_HASH_INVALID');
 return Object.freeze({...input,status:'PENDING',attemptCount:0,eventFingerprint:crypto.createHash('sha256').update(JSON.stringify(input)).digest('hex')});
}
export function markOutboxDispatched(event){if(event.status!=='PENDING')throw new Error('OUTBOX_INVALID_STATE');return Object.freeze({...event,status:'DISPATCHED',attemptCount:event.attemptCount+1})}
export function markOutboxFailed(event){if(!['PENDING','FAILED'].includes(event.status))throw new Error('OUTBOX_INVALID_STATE');return Object.freeze({...event,status:'FAILED',attemptCount:event.attemptCount+1})}