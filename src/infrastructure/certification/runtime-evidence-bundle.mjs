import crypto from 'node:crypto';
export const RUNTIME_EVIDENCE_BUNDLE_VERSION='P10.357-364-v1';
const required=(v,c)=>{if(v!==true)throw new Error(c)};
export function composeRuntimeEvidenceBundle(input){
 required(input.artifactManifestPass,'ARTIFACT_MANIFEST_REQUIRED');
 required(input.runtimeHealthObserved,'LIVE_HEALTH_OBSERVATION_REQUIRED');
 required(input.runtimeDiagnosticObserved,'LIVE_RUNTIME_OBSERVATION_REQUIRED');
 if(input.health?.ok!==true||input.health?.app!=='MTA DETENI')throw new Error('LIVE_HEALTH_IDENTITY_INVALID');
 if(input.runtime?.mode!=='PRODUCTION_RUNTIME_DIAGNOSTIC')throw new Error('LIVE_RUNTIME_IDENTITY_INVALID');
 if(input.health?.ai!=='PROVIDER_NOT_CONFIGURED'||input.runtime?.ai!=='PROVIDER_NOT_CONFIGURED')throw new Error('AI_STATE_INVALID');
 const payload={version:RUNTIME_EVIDENCE_BUNDLE_VERSION,artifactManifestFingerprint:input.artifactManifestFingerprint,observedAt:input.observedAt,health:input.health,runtime:input.runtime,runtimeHealthObserved:true,runtimeDiagnosticObserved:true,productionMutation:false,executionAuthorized:false};
 const fingerprint=crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex');
 return Object.freeze({...payload,fingerprint});
}
