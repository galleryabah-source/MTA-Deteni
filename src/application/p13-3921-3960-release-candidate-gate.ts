export type ReleaseCandidateGate = Readonly<{
  typecheck: "PASS";
  javascriptRegression: "PASS";
  typescriptRegression: "PASS";
  evidenceComplete: boolean;
  outputIdentityComplete: boolean;
  migrationFreeze: true;
  aiEnabled: false;
  productionAuthorized: false;
}>;

export function assertReleaseCandidateGate(gate: ReleaseCandidateGate): void {
  if (gate.typecheck !== "PASS" || gate.javascriptRegression !== "PASS" || gate.typescriptRegression !== "PASS") throw new Error("RELEASE_CANDIDATE_EXECUTION_NOT_CERTIFIED");
  if (!gate.evidenceComplete || !gate.outputIdentityComplete) throw new Error("RELEASE_CANDIDATE_EVIDENCE_INCOMPLETE");
  if (!gate.migrationFreeze || gate.aiEnabled || gate.productionAuthorized) throw new Error("RELEASE_CANDIDATE_GOVERNANCE_BLOCKED");
}
