export type IntegratedIntegrityAuditTerminalClosureCertificationSealReceiptDisposition = "ADMIT" | "REPLAY" | "CONFLICT";

export type IntegratedIntegrityAuditTerminalClosureCertificationSealReceiptNode = Readonly<{
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
  state: "TERMINAL_CLOSURE_CERTIFICATION_SEAL_RECEIPT_VERIFIED_FOR_REVIEW";
  authorizationGranted: false;
  dispatchApproved: false;
  externalTransportRequested: false;
  dispatchExecuted: false;
  durablePublicationCreated: false;
  syntheticOnly: true;
}>;

const registry = new Map<string, string>();
const CHECKPOINTS = Object.freeze(
  Array.from({ length: 100 }, (_, i) => {
    const start = 204881 + i * 140;
    return `P13.${start}-${start + 159}`;
  }),
);

export function integratedIntegrityAuditTerminalClosureCertificationSealReceiptCheckpoints(): readonly string[] {
  return CHECKPOINTS;
}

export function createIntegratedIntegrityAuditTerminalClosureCertificationSealReceiptNode(
  input: Omit<
    IntegratedIntegrityAuditTerminalClosureCertificationSealReceiptNode,
    "state" | "authorizationGranted" | "dispatchApproved" | "externalTransportRequested" | "dispatchExecuted" | "durablePublicationCreated" | "syntheticOnly"
  >,
): IntegratedIntegrityAuditTerminalClosureCertificationSealReceiptNode {
  if (!(CHECKPOINTS as readonly string[]).includes(input.checkpoint)) throw new Error("Unsupported terminal-closure certification-seal receipt checkpoint.");
  for (const value of [input.artifactId, input.parentArtifactId, input.decisionFingerprint, input.closureArtifactId, input.closureDecisionFingerprint, input.auditArtifactId, input.auditDecisionFingerprint, input.certificationArtifactId, input.certificationDecisionFingerprint, input.sealArtifactId, input.sealDecisionFingerprint, input.receiptArtifactId, input.receiptDecisionFingerprint]) {
    if (!value.trim()) throw new Error("Terminal-closure certification-seal receipt identity is incomplete.");
  }
  if (
    input.closureArtifactId !== input.parentArtifactId ||
    input.closureDecisionFingerprint === input.decisionFingerprint ||
    input.auditDecisionFingerprint !== input.decisionFingerprint ||
    input.certificationDecisionFingerprint === input.decisionFingerprint ||
    input.certificationArtifactId === input.auditArtifactId ||
    input.sealArtifactId === input.certificationArtifactId ||
    input.sealDecisionFingerprint === input.decisionFingerprint ||
    input.receiptArtifactId === input.sealArtifactId ||
    input.receiptDecisionFingerprint === input.decisionFingerprint
  ) throw new Error("Terminal-closure certification-seal receipt continuity mismatch.");
  return Object.freeze({
    ...input,
    state: "TERMINAL_CLOSURE_CERTIFICATION_SEAL_RECEIPT_VERIFIED_FOR_REVIEW",
    authorizationGranted: false,
    dispatchApproved: false,
    externalTransportRequested: false,
    dispatchExecuted: false,
    durablePublicationCreated: false,
    syntheticOnly: true,
  });
}

export function replayIntegratedIntegrityAuditTerminalClosureCertificationSealReceiptNode(node: IntegratedIntegrityAuditTerminalClosureCertificationSealReceiptNode): IntegratedIntegrityAuditTerminalClosureCertificationSealReceiptDisposition {
  if (!node.syntheticOnly || node.authorizationGranted || node.dispatchApproved || node.externalTransportRequested || node.dispatchExecuted || node.durablePublicationCreated) throw new Error("Certification-seal receipt node is executable or invalid.");
  const key = `${node.checkpoint}:${node.artifactId}:${node.parentArtifactId}:${node.closureArtifactId}:${node.auditArtifactId}:${node.certificationArtifactId}:${node.sealArtifactId}:${node.receiptArtifactId}`;
  const previous = registry.get(key);
  if (previous === undefined) {
    registry.set(key, node.decisionFingerprint);
    return "ADMIT";
  }
  return previous === node.decisionFingerprint ? "REPLAY" : "CONFLICT";
}

export function certifyIntegratedIntegrityAuditTerminalClosureCertificationSealReceiptNode(
  node: IntegratedIntegrityAuditTerminalClosureCertificationSealReceiptNode,
): Readonly<IntegratedIntegrityAuditTerminalClosureCertificationSealReceiptNode & { certified: true; replayDisposition: Exclude<IntegratedIntegrityAuditTerminalClosureCertificationSealReceiptDisposition, "CONFLICT"> }> {
  const replayDisposition = replayIntegratedIntegrityAuditTerminalClosureCertificationSealReceiptNode(node);
  if (replayDisposition === "CONFLICT") throw new Error("Certification-seal receipt replay conflict.");
  return Object.freeze({ ...node, certified: true, replayDisposition });
}

export function resetIntegratedIntegrityAuditTerminalClosureCertificationSealReceiptReplayRegistry(): void {
  registry.clear();
}
