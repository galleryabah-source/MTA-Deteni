export type RecoveryEvidence = Readonly<{
  rehearsalId: string;
  backupId: string;
  restoreId: string;
  backupHash: string;
  restoredArtifactHash: string;
  integrityVerified: boolean;
  journalReplayVerified: boolean;
  readModelRebuildVerified: boolean;
  observedAt: string;
  operatorId: string;
  humanSignoffId?: string;
  syntheticOnly: true;
  productionAuthorized: false;
}>;

export function assertRecoveryEvidence(input: RecoveryEvidence): void {
  const required = [input.rehearsalId, input.backupId, input.restoreId, input.backupHash, input.restoredArtifactHash, input.observedAt, input.operatorId];
  if (required.some((value) => !value.trim())) throw new Error("RECOVERY_EVIDENCE_IDENTITY_REQUIRED");
  if (!input.syntheticOnly || input.productionAuthorized) throw new Error("RECOVERY_EVIDENCE_GOVERNANCE_BLOCKED");
  if (!input.integrityVerified || !input.journalReplayVerified || !input.readModelRebuildVerified) {
    throw new Error("RECOVERY_EVIDENCE_CONTROLS_INCOMPLETE");
  }
  if (!input.humanSignoffId?.trim()) throw new Error("RECOVERY_HUMAN_SIGNOFF_REQUIRED");
}
