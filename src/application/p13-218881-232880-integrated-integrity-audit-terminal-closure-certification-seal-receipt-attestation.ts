export type IntegratedIntegrityAuditTerminalClosureCertificationSealReceiptAttestationDisposition = "ADMIT" | "REPLAY" | "CONFLICT";

export type IntegratedIntegrityAuditTerminalClosureCertificationSealReceiptAttestationNode = Readonly<{
  checkpoint: string;
  artifactId: string;
  parentArtifactId: string;
  decisionFingerprint: string;
  closureArtifactId: string;
  closureDecisionFingerprint: string;
  auditArtifactId: string;
  auditDecisionFingerprint: string;
  certificationArtifactId: string;
  certificationDecisionFingerprint: string;
  sealArtifactId: string;
  sealDecisionFingerprint: string;
  receiptArtifactId: string;
  receiptDecisionFingerprint: string;
  attestationArtifactId: string;
  attestationDecisionFingerprint: string;
  state: "TERMINAL_CLOSURE_CERTIFICATION_SEAL_RECEIPT_ATTESTATION_VERIFIED_FOR_REVIEW";
  authorizationGranted: false;
  dispatchApproved: false;
  externalTransportRequested: false;
  dispatchExecuted: false;
  durablePublicationCreated: false;
  syntheticOnly: true;
}>;

const registry = new Map<string, string>();
const CHECKPOINTS = Object.freeze(Array.from({ length: 100 }, (_, i) => {
  const start = 218881 + i * 140;
  return `P13.${start}-${start + 159}`;
}));

export function integratedIntegrityAuditTerminalClosureCertificationSealReceiptAttestationCheckpoints(): readonly string[] { return CHECKPOINTS; }

export function createIntegratedIntegrityAuditTerminalClosureCertificationSealReceiptAttestationNode(
  input: Omit<IntegratedIntegrityAuditTerminalClosureCertificationSealReceiptAttestationNode, "state" | "authorizationGranted" | "dispatchApproved" | "externalTransportRequested" | "dispatchExecuted" | "durablePublicationCreated" | "syntheticOnly">
): IntegratedIntegrityAuditTerminalClosureCertificationSealReceiptAttestationNode {
  if (!(CHECKPOINTS as readonly string[]).includes(input.checkpoint)) throw new Error("Unsupported terminal-closure certification-seal receipt attestation checkpoint.");
  for (const value of [input.artifactId,input.parentArtifactId,input.decisionFingerprint,input.closureArtifactId,input.closureDecisionFingerprint,input.auditArtifactId,input.auditDecisionFingerprint,input.certificationArtifactId,input.certificationDecisionFingerprint,input.sealArtifactId,input.sealDecisionFingerprint,input.receiptArtifactId,input.receiptDecisionFingerprint,input.attestationArtifactId,input.attestationDecisionFingerprint]) {
    if (!value.trim()) throw new Error("Terminal-closure certification-seal receipt attestation identity is incomplete.");
  }
  if (input.closureArtifactId !== input.parentArtifactId || input.closureDecisionFingerprint === input.decisionFingerprint || input.auditDecisionFingerprint !== input.decisionFingerprint || input.certificationDecisionFingerprint === input.decisionFingerprint || input.certificationArtifactId === input.auditArtifactId || input.sealArtifactId === input.certificationArtifactId || input.sealDecisionFingerprint === input.decisionFingerprint || input.receiptArtifactId === input.sealArtifactId || input.receiptDecisionFingerprint === input.decisionFingerprint || input.attestationArtifactId === input.receiptArtifactId || input.attestationDecisionFingerprint === input.decisionFingerprint) throw new Error("Terminal-closure certification-seal receipt attestation continuity mismatch.");
  return Object.freeze({...input,state:"TERMINAL_CLOSURE_CERTIFICATION_SEAL_RECEIPT_ATTESTATION_VERIFIED_FOR_REVIEW",authorizationGranted:false,dispatchApproved:false,externalTransportRequested:false,dispatchExecuted:false,durablePublicationCreated:false,syntheticOnly:true});
}

export function replayIntegratedIntegrityAuditTerminalClosureCertificationSealReceiptAttestationNode(node: IntegratedIntegrityAuditTerminalClosureCertificationSealReceiptAttestationNode): IntegratedIntegrityAuditTerminalClosureCertificationSealReceiptAttestationDisposition {
  if (!node.syntheticOnly || node.authorizationGranted || node.dispatchApproved || node.externalTransportRequested || node.dispatchExecuted || node.durablePublicationCreated) throw new Error("Attestation node is executable or invalid.");
  const key = `${node.checkpoint}:${node.artifactId}:${node.parentArtifactId}:${node.closureArtifactId}:${node.auditArtifactId}:${node.certificationArtifactId}:${node.sealArtifactId}:${node.receiptArtifactId}:${node.attestationArtifactId}`;
  const previous = registry.get(key);
  if (previous === undefined) { registry.set(key,node.decisionFingerprint); return "ADMIT"; }
  return previous === node.decisionFingerprint ? "REPLAY" : "CONFLICT";
}

export function certifyIntegratedIntegrityAuditTerminalClosureCertificationSealReceiptAttestationNode(node: IntegratedIntegrityAuditTerminalClosureCertificationSealReceiptAttestationNode): Readonly<IntegratedIntegrityAuditTerminalClosureCertificationSealReceiptAttestationNode & { certified:true; replayDisposition: Exclude<IntegratedIntegrityAuditTerminalClosureCertificationSealReceiptAttestationDisposition,"CONFLICT"> }> {
  const replayDisposition = replayIntegratedIntegrityAuditTerminalClosureCertificationSealReceiptAttestationNode(node);
  if (replayDisposition === "CONFLICT") throw new Error("Attestation replay conflict.");
  return Object.freeze({...node,certified:true,replayDisposition});
}

export function resetIntegratedIntegrityAuditTerminalClosureCertificationSealReceiptAttestationReplayRegistry(): void { registry.clear(); }
