export type P13AttestationClosureCertificationDisposition = "ADMIT" | "REPLAY" | "CONFLICT";

export type P13AttestationClosureCertificationNode = Readonly<{
  checkpoint: string;
  artifactId: string;
  parentArtifactId: string;
  decisionFingerprint: string;
  attestationClosureArtifactId: string;
  attestationClosureDecisionFingerprint: string;
  certificationArtifactId: string;
  certificationDecisionFingerprint: string;
  state: "ATTESTATION_CLOSURE_CERTIFICATION_VERIFIED_FOR_REVIEW";
  authorizationGranted: false;
  dispatchApproved: false;
  externalTransportRequested: false;
  dispatchExecuted: false;
  durablePublicationCreated: false;
  syntheticOnly: true;
}>;

const registry = new Map<string, string>();
const CHECKPOINTS = Object.freeze(Array.from({ length: 100 }, (_, i) => {
  const start = 246881 + i * 140;
  return `P13.${start}-${start + 159}`;
}));

export function p13AttestationClosureCertificationCheckpoints(): readonly string[] { return CHECKPOINTS; }

export function createP13AttestationClosureCertificationNode(
  input: Omit<P13AttestationClosureCertificationNode, "state" | "authorizationGranted" | "dispatchApproved" | "externalTransportRequested" | "dispatchExecuted" | "durablePublicationCreated" | "syntheticOnly">
): P13AttestationClosureCertificationNode {
  if (!(CHECKPOINTS as readonly string[]).includes(input.checkpoint)) throw new Error("Unsupported P13 attestation-closure certification checkpoint.");
  for (const value of [input.artifactId, input.parentArtifactId, input.decisionFingerprint, input.attestationClosureArtifactId, input.attestationClosureDecisionFingerprint, input.certificationArtifactId, input.certificationDecisionFingerprint]) {
    if (!value.trim()) throw new Error("P13 attestation-closure certification identity is incomplete.");
  }
  if (input.attestationClosureArtifactId === input.artifactId || input.attestationClosureArtifactId === input.parentArtifactId || input.attestationClosureDecisionFingerprint === input.decisionFingerprint || input.certificationArtifactId === input.artifactId || input.certificationArtifactId === input.parentArtifactId || input.certificationArtifactId === input.attestationClosureArtifactId || input.certificationDecisionFingerprint === input.decisionFingerprint || input.certificationDecisionFingerprint === input.attestationClosureDecisionFingerprint) throw new Error("P13 attestation-closure certification continuity mismatch.");
  return Object.freeze({
    ...input,
    state: "ATTESTATION_CLOSURE_CERTIFICATION_VERIFIED_FOR_REVIEW",
    authorizationGranted: false,
    dispatchApproved: false,
    externalTransportRequested: false,
    dispatchExecuted: false,
    durablePublicationCreated: false,
    syntheticOnly: true,
  });
}

export function replayP13AttestationClosureCertificationNode(node: P13AttestationClosureCertificationNode): P13AttestationClosureCertificationDisposition {
  if (!node.syntheticOnly || node.authorizationGranted || node.dispatchApproved || node.externalTransportRequested || node.dispatchExecuted || node.durablePublicationCreated) throw new Error("P13 attestation-closure certification node is executable or invalid.");
  const key = `${node.checkpoint}:${node.artifactId}:${node.parentArtifactId}:${node.attestationClosureArtifactId}:${node.certificationArtifactId}`;
  const previous = registry.get(key);
  if (previous === undefined) {
    registry.set(key, node.decisionFingerprint);
    return "ADMIT";
  }
  return previous === node.decisionFingerprint ? "REPLAY" : "CONFLICT";
}

export function certifyP13AttestationClosureCertificationNode(node: P13AttestationClosureCertificationNode): Readonly<P13AttestationClosureCertificationNode & { certified: true; replayDisposition: Exclude<P13AttestationClosureCertificationDisposition, "CONFLICT"> }> {
  const replayDisposition = replayP13AttestationClosureCertificationNode(node);
  if (replayDisposition === "CONFLICT") throw new Error("P13 attestation-closure certification replay conflict.");
  return Object.freeze({ ...node, certified: true, replayDisposition });
}

export function resetP13AttestationClosureCertificationReplayRegistry(): void { registry.clear(); }
