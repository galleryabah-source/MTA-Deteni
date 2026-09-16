export type P13AttestationClosureDisposition = "ADMIT" | "REPLAY" | "CONFLICT";
export type P13AttestationClosureNode = Readonly<{
  checkpoint:string; artifactId:string; parentArtifactId:string; decisionFingerprint:string;
  attestationArtifactId:string; attestationDecisionFingerprint:string;
  state:"ATTESTATION_CLOSURE_VERIFIED_FOR_REVIEW";
  authorizationGranted:false; dispatchApproved:false; externalTransportRequested:false;
  dispatchExecuted:false; durablePublicationCreated:false; syntheticOnly:true;
}>;
const registry=new Map<string,string>();
const CHECKPOINTS=Object.freeze(Array.from({length:100},(_,i)=>{const start=232881+i*140;return `P13.${start}-${start+159}`;}));
export function p13AttestationClosureCheckpoints():readonly string[]{return CHECKPOINTS;}
export function createP13AttestationClosureNode(input:Omit<P13AttestationClosureNode,"state"|"authorizationGranted"|"dispatchApproved"|"externalTransportRequested"|"dispatchExecuted"|"durablePublicationCreated"|"syntheticOnly">):P13AttestationClosureNode{
 if(!CHECKPOINTS.includes(input.checkpoint))throw new Error("Unsupported P13 attestation-closure checkpoint.");
 for(const v of [input.artifactId,input.parentArtifactId,input.decisionFingerprint,input.attestationArtifactId,input.attestationDecisionFingerprint])if(!v.trim())throw new Error("P13 attestation-closure identity is incomplete.");
 if(input.attestationArtifactId===input.artifactId||input.attestationArtifactId===input.parentArtifactId||input.attestationDecisionFingerprint===input.decisionFingerprint)throw new Error("P13 attestation-closure continuity mismatch.");
 return Object.freeze({...input,state:"ATTESTATION_CLOSURE_VERIFIED_FOR_REVIEW",authorizationGranted:false,dispatchApproved:false,externalTransportRequested:false,dispatchExecuted:false,durablePublicationCreated:false,syntheticOnly:true});
}
export function replayP13AttestationClosureNode(node:P13AttestationClosureNode):P13AttestationClosureDisposition{
 if(!node.syntheticOnly||node.authorizationGranted||node.dispatchApproved||node.externalTransportRequested||node.dispatchExecuted||node.durablePublicationCreated)throw new Error("P13 attestation-closure node is executable or invalid.");
 const key=`${node.checkpoint}:${node.artifactId}:${node.parentArtifactId}:${node.attestationArtifactId}`;const previous=registry.get(key);if(previous===undefined){registry.set(key,node.decisionFingerprint);return "ADMIT";}return previous===node.decisionFingerprint?"REPLAY":"CONFLICT";
}
export function certifyP13AttestationClosureNode(node:P13AttestationClosureNode):Readonly<P13AttestationClosureNode&{certified:true;replayDisposition:Exclude<P13AttestationClosureDisposition,"CONFLICT">}>{const replayDisposition=replayP13AttestationClosureNode(node);if(replayDisposition==="CONFLICT")throw new Error("P13 attestation-closure replay conflict.");return Object.freeze({...node,certified:true,replayDisposition});}
export function resetP13AttestationClosureReplayRegistry():void{registry.clear();}
