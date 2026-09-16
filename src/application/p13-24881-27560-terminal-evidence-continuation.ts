export type TerminalEvidenceContinuationDisposition = "ADMIT" | "REPLAY" | "CONFLICT";
export type TerminalEvidenceContinuationNode = Readonly<{
  checkpoint: string;
  artifactId: string;
  parentArtifactId: string;
  decisionFingerprint: string;
  state: "CLOSED_FOR_REVIEW" | "VERIFIED_FOR_REVIEW" | "READY_FOR_REVIEW";
  authorizationGranted: false;
  dispatchApproved: false;
  externalTransportRequested: false;
  dispatchExecuted: false;
  durablePublicationCreated: false;
  syntheticOnly: true;
}>;

const registry = new Map<string, string>();

const CHECKPOINTS = Object.freeze([
  "P13.24881-25040","P13.25041-25160","P13.25161-25280",
  "P13.25281-25440","P13.25441-25560","P13.25561-25680",
  "P13.25681-25840","P13.25841-25960","P13.25961-26080",
  "P13.26081-26240","P13.26241-26360","P13.26361-26480",
  "P13.26481-26640","P13.26641-26760","P13.26761-26880",
  "P13.26881-27040","P13.27041-27160","P13.27161-27280",
  "P13.27281-27440","P13.27441-27560",
] as const);

export function terminalEvidenceContinuationCheckpoints(): readonly string[] { return CHECKPOINTS; }

export function createTerminalEvidenceContinuationNode(input: { checkpoint: string; artifactId: string; parentArtifactId: string; decisionFingerprint: string; state: TerminalEvidenceContinuationNode["state"] }): TerminalEvidenceContinuationNode {
  if (!(CHECKPOINTS as readonly string[]).includes(input.checkpoint)) throw new Error("Unsupported terminal evidence continuation checkpoint.");
  if (!input.artifactId.trim() || !input.parentArtifactId.trim() || !input.decisionFingerprint.trim()) throw new Error("Terminal evidence continuation identity is incomplete.");
  return Object.freeze({ checkpoint: input.checkpoint, artifactId: input.artifactId, parentArtifactId: input.parentArtifactId, decisionFingerprint: input.decisionFingerprint, state: input.state, authorizationGranted: false, dispatchApproved: false, externalTransportRequested: false, dispatchExecuted: false, durablePublicationCreated: false, syntheticOnly: true });
}

export function replayTerminalEvidenceContinuationNode(node: TerminalEvidenceContinuationNode): TerminalEvidenceContinuationDisposition {
  if (!node.syntheticOnly || node.authorizationGranted || node.dispatchApproved || node.externalTransportRequested || node.dispatchExecuted || node.durablePublicationCreated) throw new Error("Terminal evidence continuation node is invalid or executable.");
  const key = `${node.checkpoint}:${node.artifactId}:${node.parentArtifactId}`;
  const previous = registry.get(key);
  if (previous === undefined) { registry.set(key, node.decisionFingerprint); return "ADMIT"; }
  if (previous === node.decisionFingerprint) return "REPLAY";
  return "CONFLICT";
}

export function certifyTerminalEvidenceContinuationNode(node: TerminalEvidenceContinuationNode): Readonly<TerminalEvidenceContinuationNode & { certified: true; replayDisposition: Exclude<TerminalEvidenceContinuationDisposition, "CONFLICT"> }> {
  const replayDisposition = replayTerminalEvidenceContinuationNode(node);
  if (replayDisposition === "CONFLICT") throw new Error("Terminal evidence continuation replay conflict.");
  return Object.freeze({ ...node, certified: true, replayDisposition });
}

export function resetTerminalEvidenceContinuationReplayRegistry(): void { registry.clear(); }
