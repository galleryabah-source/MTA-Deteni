export type SyntheticReleaseEvidence = Readonly<{
  evidenceId: string;
  branch: string;
  commitSha: string;
  syntheticOnly: true;
  migrationFreeze: true;
  aiEnabled: false;
  productionAuthorized: false;
  checks: readonly string[];
  capturedAt: string;
}>;

export function buildSyntheticReleaseEvidence(input: Omit<SyntheticReleaseEvidence, "syntheticOnly" | "migrationFreeze" | "aiEnabled" | "productionAuthorized">): SyntheticReleaseEvidence {
  if (!input.evidenceId.trim() || !input.branch.trim() || !input.commitSha.trim() || !input.capturedAt.trim()) throw new Error("SYNTHETIC_RELEASE_EVIDENCE_IDENTITY_REQUIRED");
  if (input.checks.length === 0) throw new Error("SYNTHETIC_RELEASE_CHECKS_REQUIRED");
  return { ...input, syntheticOnly: true, migrationFreeze: true, aiEnabled: false, productionAuthorized: false };
}
