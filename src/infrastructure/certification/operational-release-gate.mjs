export const OPERATIONAL_RELEASE_GATE_VERSION='P10.349-356-v1';
export function evaluateOperationalReleaseGate(input){
 const required=['artifactManifestPass','runtimeEvidencePass','securityEvidencePass','observabilityEvidencePass','backupEvidencePass','rollbackPlanVerified','operatorApproval','changeWindowOpen'];
 for(const k of required)if(input[k]!==true)throw new Error('RELEASE_GATE_PREREQUISITE_FAILED:'+k);
 if(input.executionAuthorized===true||input.productionMutation===true)throw new Error('PRODUCTION_AUTHORIZATION_MUST_REMAIN_SEPARATE');
 if(input.runtimeEvidence?.productionMutation===true)throw new Error('RUNTIME_EVIDENCE_MUTATION_UNSAFE');
 return Object.freeze({
   version:OPERATIONAL_RELEASE_GATE_VERSION,
   status:'READY_FOR_SEPARATE_GOVERNED_PRODUCTION_DECISION',
   artifactManifestPass:true,runtimeEvidencePass:true,securityEvidencePass:true,
   observabilityEvidencePass:true,backupEvidencePass:true,rollbackPlanVerified:true,
   operatorApproval:true,changeWindowOpen:true,
   productionCertified:false,executionAuthorized:false,productionMutation:false,
   externalTransport:false
 });
}
