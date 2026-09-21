import crypto from 'node:crypto';
export const RELEASE_VERIFICATION_EVIDENCE_VERSION='P10.381-388-v1';
export function composeReleaseVerificationEvidence(input){
  const required=['finalReleaseEvidence','deploymentReconciled','runtimeHealthy','runtimeIdentityVerified','artifactIdentityVerified'];
  for(const k of required)if(input[k]!==true)throw new Error('VERIFICATION_PREREQUISITE_FAILED:'+k);
  if(input.releaseCommit!==input.deployedCommit)throw new Error('VERIFICATION_COMMIT_MISMATCH');
  if(input.productionMutation===true||input.executionAuthorized===true)throw new Error('VERIFICATION_CANNOT_AUTHORIZE_PRODUCTION');
  const payload={version:RELEASE_VERIFICATION_EVIDENCE_VERSION,releaseCommit:input.releaseCommit,deployedCommit:input.deployedCommit,artifactManifestFingerprint:input.artifactManifestFingerprint,runtimeEvidenceFingerprint:input.runtimeEvidenceFingerprint,finalReleaseEvidence:true,deploymentReconciled:true,runtimeHealthy:true,runtimeIdentityVerified:true,artifactIdentityVerified:true,productionMutation:false,executionAuthorized:false};
  return Object.freeze({...payload,evidenceFingerprint:crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex')});
}