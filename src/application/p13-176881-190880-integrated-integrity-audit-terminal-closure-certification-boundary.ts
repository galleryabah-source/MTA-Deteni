export type IntegratedIntegrityAuditTerminalClosureCertificationBoundaryDisposition="ADMIT"|"REPLAY"|"CONFLICT";
export type IntegratedIntegrityAuditTerminalClosureCertificationBoundaryNode=Readonly<{
  checkpoint:string;
  artifactId:string;
  parentArtifactId:string;
  decisionFingerprint:string;
  closureArtifactId:string;
  closureDecisionFingerprint:string;
  auditArtifactId:string;
  auditDecisionFingerprint:string;
  certificationArtifactId:string;
  certificationDecisionFingerprint:string;
  state:"TERMINAL_CLOSURE_CERTIFICATION_BOUNDARY_VERIFIED_FOR_REVIEW";
  authorizationGranted:false;
  dispatchApproved:false;
  externalTransportRequested:false;
  dispatchExecuted:false;
  durablePublicationCreated:false;
  syntheticOnly:true;
}>;

const registry=new Map<string,string>();
const CHECKPOINTS=Object.freeze(Array.from({length:100},(_,i)=>{const s=176881+i*140;const e=s+(i===99?139:159);return `P13.${s}-${e}`}));

export function integratedIntegrityAuditTerminalClosureCertificationBoundaryCheckpoints():readonly string[]{return CHECKPOINTS;}

export function createIntegratedIntegrityAuditTerminalClosureCertificationBoundaryNode(input:Omit<IntegratedIntegrityAuditTerminalClosureCertificationBoundaryNode,"state"|"authorizationGranted"|"dispatchApproved"|"externalTransportRequested"|"dispatchExecuted"|"durablePublicationCreated"|"syntheticOnly">):IntegratedIntegrityAuditTerminalClosureCertificationBoundaryNode{
  if(!(CHECKPOINTS as readonly string[]).includes(input.checkpoint))throw new Error("Unsupported integrated integrity-audit terminal-closure certification-boundary checkpoint.");
  for(const v of [input.artifactId,input.parentArtifactId,input.decisionFingerprint,input.closureArtifactId,input.closureDecisionFingerprint,input.auditArtifactId,input.auditDecisionFingerprint,input.certificationArtifactId,input.certificationDecisionFingerprint])if(!v.trim())throw new Error("Integrated integrity-audit terminal-closure certification-boundary identity is incomplete.");
  if(input.closureArtifactId!==input.parentArtifactId||input.closureDecisionFingerprint===input.decisionFingerprint||input.auditDecisionFingerprint!==input.decisionFingerprint||input.certificationDecisionFingerprint===input.decisionFingerprint||input.certificationArtifactId===input.auditArtifactId)throw new Error("Integrated integrity-audit terminal-closure certification-boundary continuity mismatch.");
  return Object.freeze({...input,state:"TERMINAL_CLOSURE_CERTIFICATION_BOUNDARY_VERIFIED_FOR_REVIEW",authorizationGranted:false,dispatchApproved:false,externalTransportRequested:false,dispatchExecuted:false,durablePublicationCreated:false,syntheticOnly:true});
}

export function replayIntegratedIntegrityAuditTerminalClosureCertificationBoundaryNode(node:IntegratedIntegrityAuditTerminalClosureCertificationBoundaryNode):IntegratedIntegrityAuditTerminalClosureCertificationBoundaryDisposition{
  if(!node.syntheticOnly||node.authorizationGranted||node.dispatchApproved||node.externalTransportRequested||node.dispatchExecuted||node.durablePublicationCreated)throw new Error("Integrated integrity-audit terminal-closure certification-boundary node is executable or invalid.");
  const key=`${node.checkpoint}:${node.artifactId}:${node.parentArtifactId}:${node.closureArtifactId}:${node.auditArtifactId}:${node.certificationArtifactId}`;
  const p=registry.get(key);
  if(p===undefined){registry.set(key,node.decisionFingerprint);return "ADMIT";}
  return p===node.decisionFingerprint?"REPLAY":"CONFLICT";
}

export function certifyIntegratedIntegrityAuditTerminalClosureCertificationBoundaryNode(node:IntegratedIntegrityAuditTerminalClosureCertificationBoundaryNode):Readonly<IntegratedIntegrityAuditTerminalClosureCertificationBoundaryNode&{certified:true;replayDisposition:Exclude<IntegratedIntegrityAuditTerminalClosureCertificationBoundaryDisposition,"CONFLICT">}>{
  const replayDisposition=replayIntegratedIntegrityAuditTerminalClosureCertificationBoundaryNode(node);
  if(replayDisposition==="CONFLICT")throw new Error("Integrated integrity-audit terminal-closure certification-boundary replay conflict.");
  return Object.freeze({...node,certified:true,replayDisposition});
}

export function resetIntegratedIntegrityAuditTerminalClosureCertificationBoundaryReplayRegistry():void{registry.clear();}
