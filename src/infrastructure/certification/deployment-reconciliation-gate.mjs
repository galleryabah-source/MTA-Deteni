export const DEPLOYMENT_RECONCILIATION_VERSION='P10.365-372-v1';
export function reconcileDeploymentEvidence(input){
 for(const k of ['releaseCommit','deployedCommit','artifactManifestFingerprint','runtimeEvidenceFingerprint'])if(typeof input[k]!=='string'||!input[k])throw new Error(k.toUpperCase()+'_REQUIRED');
 if(input.releaseCommit!==input.deployedCommit)throw new Error('DEPLOYED_COMMIT_MISMATCH');
 if(!/^[0-9a-f]{64}$/i.test(input.artifactManifestFingerprint)||!/^[0-9a-f]{64}$/i.test(input.runtimeEvidenceFingerprint))throw new Error('EVIDENCE_FINGERPRINT_INVALID');
 if(input.workflowDeploymentObserved!==true)throw new Error('WORKFLOW_DEPLOYMENT_OBSERVATION_REQUIRED');
 if(input.runtimeEvidenceObserved!==true)throw new Error('RUNTIME_EVIDENCE_REQUIRED');
 return Object.freeze({version:DEPLOYMENT_RECONCILIATION_VERSION,status:'DEPLOYMENT_AND_RUNTIME_RECONCILED',releaseCommit:input.releaseCommit,deployedCommit:input.deployedCommit,artifactManifestFingerprint:input.artifactManifestFingerprint,runtimeEvidenceFingerprint:input.runtimeEvidenceFingerprint,productionMutation:false,executionAuthorized:false});
}