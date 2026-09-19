export type IntegratedIntegrityAuditTerminalClosureCertificationSealDisposition = "ADMIT" | "REPLAY" | "CONFLICT";

export type IntegratedIntegrityAuditTerminalClosureCertificationSealNode = Readonly<{
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
  state: "TERMINAL_CLOSURE_CERTIFICATION_SEAL_VERIFIED_FOR_REVIEW";
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
    const start = 190881 + i * 140;
    return `P13.${start}-${start + (i === 99 ? 139 : 159)}`;
  }),
);

export function integratedIntegrityAuditTerminalClosureCertificationSealCheckpoints(): readonly string[] {
  return CHECKPOINTS;
}

export function createIntegratedIntegrityAuditTerminalClosureCertificationSealNode(
  input: Omit<
    IntegratedIntegrityAuditTerminalClosureCertificationSealNode,
    "state" | "authorizationGranted" | "dispatchApproved" | "externalTransportRequested" | "dispatchExecuted" | "durablePublicationCreated" | "syntheticOnly"
  >,
): IntegratedIntegrityAuditTerminalClosureCertificationSealNode {
  if (!(CHECKPOINTS as readonly string[]).includes(input.checkpoint)) throw new Error("Unsupported terminal-closure certification-seal checkpoint.");
  for (const value of [input.artifactId, input.parentArtifactId, input.decisionFingerprint, input.closureArtifactId, input.closureDecisionFingerprint, input.auditArtifactId, input.auditDecisionFingerprint, input.certificationArtifactId, input.certificationDecisionFingerprint, input.sealArtifactId, input.sealDecisionFingerprint]) {
    if (!value.trim()) throw new Error("Terminal-closure certification-seal identity is incomplete.");
  }
  if (
    input.closureArtifactId !== input.parentArtifactId ||
    input.closureDecisionFingerprint === input.decisionFingerprint ||
    input.auditDecisionFingerprint !== input.decisionFingerprint ||
    input.certificationDecisionFingerprint === input.decisionFingerprint ||
    input.certificationArtifactId === input.auditArtifactId ||
    input.sealArtifactId === input.certificationArtifactId ||
    input.sealDecisionFingerprint === input.decisionFingerprint
  ) throw new Error("Terminal-closure certification-seal continuity mismatch.");
  return Object.freeze({
    ...input,
    state: "TERMINAL_CLOSURE_CERTIFICATION_SEAL_VERIFIED_FOR_REVIEW",
    authorizationGranted: false,
    dispatchApproved: false,
    externalTransportRequested: false,
    dispatchExecuted: false,
    durablePublicationCreated: false,
    syntheticOnly: true,
  });
}

export function replayIntegratedIntegrityAuditTerminalClosureCertificationSealNode(node: IntegratedIntegrityAuditTerminalClosureCertificationSealNode): IntegratedIntegrityAuditTerminalClosureCertificationSealDisposition {
  if (!node.syntheticOnly || node.authorizationGranted || node.dispatchApproved || node.externalTransportRequested || node.dispatchExecuted || node.durablePublicationCreated) throw new Error("Certification-seal node is executable or invalid.");
  const key = `${node.checkpoint}:${node.artifactId}:${node.parentArtifactId}:${node.closureArtifactId}:${node.auditArtifactId}:${node.certificationArtifactId}:${node.sealArtifactId}`;
  const previous = registry.get(key);
  if (previous === undefined) {
    registry.set(key, node.decisionFingerprint);
    return "ADMIT";
  }
  return previous === node.decisionFingerprint ? "REPLAY" : "CONFLICT";
}

export function certifyIntegratedIntegrityAuditTerminalClosureCertificationSealNode(
  node: IntegratedIntegrityAuditTerminalClosureCertificationSealNode,
): Readonly<IntegratedIntegrityAuditTerminalClosureCertificationSealNode & { certified: true; replayDisposition: Exclude<IntegratedIntegrityAuditTerminalClosureCertificationSealDisposition, "CONFLICT"> }> {
  const replayDisposition = replayIntegratedIntegrityAuditTerminalClosureCertificationSealNode(node);
  if (replayDisposition === "CONFLICT") throw new Error("Certification-seal replay conflict.");
  return Object.freeze({ ...node, certified: true, replayDisposition });
}

export function resetIntegratedIntegrityAuditTerminalClosureCertificationSealReplayRegistry(): void {
  registry.clear();
}
