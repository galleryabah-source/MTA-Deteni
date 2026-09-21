import crypto from 'node:crypto';
export const RELEASE_CONTROL_CHAIN_VERSION='P10.405-412-v1';
const gates=['releaseCandidate','artifactIntegrity','runtimeVerification','operationalRelease','runtimeEvidence','deploymentReconciliation','finalReleaseEvidence','releaseVerification','productionHandoff','rollbackReadiness'];
export function composeReleaseControlChain(input){
 for(const k of gates)if(input[k]!==true)throw new Error('RELEASE_CONTROL_GATE_FAILED:'+k);
 const payload={version:RELEASE_CONTROL_CHAIN_VERSION,gates:gates.map(k=>({name:k,status:'PASS'})),releaseCommit:input.releaseCommit,artifactManifestFingerprint:input.artifactManifestFingerprint,runtimeEvidenceFingerprint:input.runtimeEvidenceFingerprint,rollbackReference:input.rollbackReference,productionCertified:false,executionAuthorized:false,productionMutation:false,externalTransport:false};
 return Object.freeze({...payload,chainFingerprint:crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex')});
}