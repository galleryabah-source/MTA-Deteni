export type IntegratedIntegrityAuditCertificationDisposition="ADMIT"|"REPLAY"|"CONFLICT";
export type IntegratedIntegrityAuditCertificationNode=Readonly<{
 checkpoint:string;artifactId:string;parentArtifactId:string;decisionFingerprint:string;
 precedingArtifactId:string;precedingDecisionFingerprint:string;auditArtifactId:string;auditDecisionFingerprint:string;
 state:"CERTIFIED_INTEGRITY_AUDIT_FOR_REVIEW";authorizationGranted:false;dispatchApproved:false;
 externalTransportRequested:false;dispatchExecuted:false;durablePublicationCreated:false;syntheticOnly:true;
}>;
const registry=new Map<string,string>();
const CHECKPOINTS=Object.freeze(["P13.67561-67720","P13.67721-67840","P13.67841-68000","P13.68001-68120","P13.68121-68240","P13.68241-68400","P13.68401-68520","P13.68521-68640","P13.68641-68800","P13.68801-68920","P13.68921-69040","P13.69041-69200","P13.69201-69320","P13.69321-69440","P13.69441-69600","P13.69601-69720","P13.69721-69840","P13.69841-70000","P13.70001-70120","P13.70121-70240"] as const);
export function integratedIntegrityAuditCertificationCheckpoints():readonly string[]{return CHECKPOINTS;}
export function createIntegratedIntegrityAuditCertificationNode(input:{checkpoint:string;artifactId:string;parentArtifactId:string;decisionFingerprint:string;precedingArtifactId:string;precedingDecisionFingerprint:string;auditArtifactId:string;auditDecisionFingerprint:string}):IntegratedIntegrityAuditCertificationNode{
 if(!(CHECKPOINTS as readonly string[]).includes(input.checkpoint))throw new Error("Unsupported integrated integrity-audit certification checkpoint.");
 for(const value of [input.artifactId,input.parentArtifactId,input.decisionFingerprint,input.precedingArtifactId,input.precedingDecisionFingerprint,input.auditArtifactId,input.auditDecisionFingerprint])if(!value.trim())throw new Error("Integrated integrity-audit certification identity is incomplete.");
 if(input.precedingArtifactId!==input.parentArtifactId)throw new Error("Preceding certified artifact continuity mismatch.");
 if(input.auditDecisionFingerprint!==input.decisionFingerprint)throw new Error("Audit decision-fingerprint continuity mismatch.");
 if(input.precedingDecisionFingerprint===input.decisionFingerprint)throw new Error("Integrated certification requires a distinct certification fingerprint.");
 return Object.freeze({...input,state:"CERTIFIED_INTEGRITY_AUDIT_FOR_REVIEW",authorizationGranted:false,dispatchApproved:false,externalTransportRequested:false,dispatchExecuted:false,durablePublicationCreated:false,syntheticOnly:true});
}
export function replayIntegratedIntegrityAuditCertificationNode(node:IntegratedIntegrityAuditCertificationNode):IntegratedIntegrityAuditCertificationDisposition{
 if(!node.syntheticOnly||node.authorizationGranted||node.dispatchApproved||node.externalTransportRequested||node.dispatchExecuted||node.durablePublicationCreated)throw new Error("Integrated integrity-audit certification node is executable or invalid.");
 if(node.precedingArtifactId!==node.parentArtifactId||node.auditDecisionFingerprint!==node.decisionFingerprint)throw new Error("Integrated integrity-audit certification continuity is invalid.");
 const key=`${node.checkpoint}:${node.artifactId}:${node.parentArtifactId}:${node.precedingArtifactId}:${node.auditArtifactId}`;const previous=registry.get(key);
 if(previous===undefined){registry.set(key,node.decisionFingerprint);return "ADMIT";}return previous===node.decisionFingerprint?"REPLAY":"CONFLICT";
}
export function certifyIntegratedIntegrityAuditCertificationNode(node:IntegratedIntegrityAuditCertificationNode):Readonly<IntegratedIntegrityAuditCertificationNode&{certified:true;replayDisposition:Exclude<IntegratedIntegrityAuditCertificationDisposition,"CONFLICT">}>{const replayDisposition=replayIntegratedIntegrityAuditCertificationNode(node);if(replayDisposition==="CONFLICT")throw new Error("Integrated integrity-audit certification replay conflict.");return Object.freeze({...node,certified:true,replayDisposition});}
export function resetIntegratedIntegrityAuditCertificationReplayRegistry():void{registry.clear();}
