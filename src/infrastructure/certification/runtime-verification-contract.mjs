const sha256=async value=>{const d=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify(value)));return Array.from(new Uint8Array(d),b=>b.toString(16).padStart(2,'0')).join('')};
export const RUNTIME_VERIFICATION_VERSION='P10.341-348-v1';
export const REQUIRED_HEALTH_FIELDS=Object.freeze(['ok','app','runtime','database','storage','ai']);
export const REQUIRED_RUNTIME_FIELDS=Object.freeze(['mode','persistence','authorization','productionDatabase','productionStorage','ai','offlineQueue','mobileShell']);
export function verifyRuntimeEvidence(input){
 if(input.manifestFingerprint?.length!==64)throw new Error('MANIFEST_FINGERPRINT_REQUIRED');
 if(input.endpoint!=='/api/health')throw new Error('HEALTH_ENDPOINT_REQUIRED');
 for(const k of REQUIRED_HEALTH_FIELDS)if(input.health?.[k]===undefined)throw new Error('HEALTH_FIELD_MISSING:'+k);
 for(const k of REQUIRED_RUNTIME_FIELDS)if(input.runtime?.[k]===undefined)throw new Error('RUNTIME_FIELD_MISSING:'+k);
 if(input.health.ok!==true||input.health.app!=='MTA DETENI')throw new Error('HEALTH_IDENTITY_INVALID');
 if(input.health.ai!=='PROVIDER_NOT_CONFIGURED'||input.runtime.ai!=='PROVIDER_NOT_CONFIGURED')throw new Error('AI_SAFETY_STATE_INVALID');
 if(input.health.migrationFreeze!==false)throw new Error('MIGRATION_FREEZE_RUNTIME_STATE_UNEXPECTED');
 if(input.networkObserved!==true)throw new Error('NETWORK_OBSERVATION_REQUIRED');
 const evidence={version:RUNTIME_VERIFICATION_VERSION,manifestFingerprint:input.manifestFingerprint,endpoint:input.endpoint,health:input.health,runtime:input.runtime,networkObserved:true,productionMutation:false,executionAuthorized:false};
 return Object.freeze({...evidence,evidenceFingerprint:await sha256(evidence)});
}
