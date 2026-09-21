export type P13IntegrityCertificationEvidenceContinuationDisposition = "ADMIT" | "REPLAY" | "CONFLICT";

export type P13IntegrityCertificationEvidenceContinuationNode = Readonly<{
  checkpoint: string;
  artifactId: string;
  parentArtifactId: string;
  decisionFingerprint: string;
  certificationArtifactId: string;
  certificationDecisionFingerprint: string;
  evidenceArtifactId: string;
  evidenceDecisionFingerprint: string;
  state: "INTEGRITY_CERTIFICATION_EVIDENCE_VERIFIED_FOR_REVIEW";
  authorizationGranted: false;
  dispatchApproved: false;
  externalTransportRequested: false;
  dispatchExecuted: false;
  durablePublicationCreated: false;
  syntheticOnly: true;
}>;

const registry = new Map<string, string>();
const CHECKPOINTS = Object.freeze(Array.from({ length: 100 }, (_, i) => {
  const start = 260881 + i * 140;
  return `P13.${start}-${start + (i === 99 ? 139 : 159)}`;
}));

export function p13IntegrityCertificationEvidenceContinuationCheckpoints(): readonly string[] {
  return CHECKPOINTS;
}

export function createP13IntegrityCertificationEvidenceContinuationNode(
  input: Omit<P13IntegrityCertificationEvidenceContinuationNode, "state" | "authorizationGranted" | "dispatchApproved" | "externalTransportRequested" | "dispatchExecuted" | "durablePublicationCreated" | "syntheticOnly">
): P13IntegrityCertificationEvidenceContinuationNode {
  if (!(CHECKPOINTS as readonly string[]).includes(input.checkpoint)) throw new Error("Unsupported P13 integrity-certification evidence checkpoint.");
  for (const value of [input.artifactId, input.parentArtifactId, input.decisionFingerprint, input.certificationArtifactId, input.certificationDecisionFingerprint, input.evidenceArtifactId, input.evidenceDecisionFingerprint]) {
    if (!value.trim()) throw new Error("P13 integrity-certification evidence identity is incomplete.");
  }
  if (
    input.certificationArtifactId === input.artifactId ||
    input.certificationArtifactId === input.parentArtifactId ||
    input.evidenceArtifactId === input.artifactId ||
    input.evidenceArtifactId === input.parentArtifactId ||
    input.evidenceArtifactId === input.certificationArtifactId ||
    input.certificationDecisionFingerprint === input.decisionFingerprint ||
    input.evidenceDecisionFingerprint === input.decisionFingerprint ||
    input.evidenceDecisionFingerprint === input.certificationDecisionFingerprint
  ) throw new Error("P13 integrity-certification evidence continuity mismatch.");
  return Object.freeze({
    ...input,
    state: "INTEGRITY_CERTIFICATION_EVIDENCE_VERIFIED_FOR_REVIEW",
    authorizationGranted: false,
    dispatchApproved: false,
    externalTransportRequested: false,
    dispatchExecuted: false,
    durablePublicationCreated: false,
    syntheticOnly: true,
  });
}

export function replayP13IntegrityCertificationEvidenceContinuationNode(
  node: P13IntegrityCertificationEvidenceContinuationNode,
): P13IntegrityCertificationEvidenceContinuationDisposition {
  if (!node.syntheticOnly || node.authorizationGranted || node.dispatchApproved || node.externalTransportRequested || node.dispatchExecuted || node.durablePublicationCreated) {
    throw new Error("P13 integrity-certification evidence node is executable or invalid.");
  }
  const key = `${node.checkpoint}:${node.artifactId}:${node.parentArtifactId}:${node.certificationArtifactId}:${node.evidenceArtifactId}`;
  const previous = registry.get(key);
  if (previous === undefined) {
    registry.set(key, node.decisionFingerprint);
    return "ADMIT";
  }
  return previous === node.decisionFingerprint ? "REPLAY" : "CONFLICT";
}

export function certifyP13IntegrityCertificationEvidenceContinuationNode(
  node: P13IntegrityCertificationEvidenceContinuationNode,
): Readonly<P13IntegrityCertificationEvidenceContinuationNode & { certified: true; replayDisposition: Exclude<P13IntegrityCertificationEvidenceContinuationDisposition, "CONFLICT"> }> {
  const replayDisposition = replayP13IntegrityCertificationEvidenceContinuationNode(node);
  if (replayDisposition === "CONFLICT") throw new Error("P13 integrity-certification evidence replay conflict.");
  return Object.freeze({ ...node, certified: true, replayDisposition });
}

export function resetP13IntegrityCertificationEvidenceContinuationReplayRegistry(): void {
  registry.clear();
}
