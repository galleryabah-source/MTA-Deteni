export const GOVERNED_DECISION_PACKET_VERSION='P10.413-420-v1';
export function composeGovernedDecisionPacket(input){
 for(const k of ['releaseControlChainPass','changeControlComplete','operatorApproval','securityGatePassed','observabilityReady','backupVerified','rollbackReady'])if(input[k]!==true)throw new Error('DECISION_PACKET_PREREQUISITE_FAILED:'+k);
 if(!input.decisionId||!input.decisionReason)throw new Error('DECISION_METADATA_REQUIRED');
 return Object.freeze({version:GOVERNED_DECISION_PACKET_VERSION,status:'READY_FOR_HUMAN_GOVERNED_DECISION',decisionId:input.decisionId,decisionReason:input.decisionReason,releaseControlFingerprint:input.releaseControlFingerprint,productionCertified:false,executionAuthorized:false,productionMutation:false,externalTransport:false});
}