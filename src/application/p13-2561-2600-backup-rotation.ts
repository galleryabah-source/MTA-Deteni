export type BackupRotationPolicy = Readonly<{
  maxRetained: number;
  requireVerifiedRestoreBeforeRotation: true;
  syntheticOnly: true;
}>;

export type BackupRotationDecision = "ALLOW" | "BLOCK";

export function evaluateBackupRotation(policy: BackupRotationPolicy, verifiedRestoreAvailable: boolean, retainedCount: number): BackupRotationDecision {
  if (!Number.isInteger(policy.maxRetained) || policy.maxRetained < 1) throw new Error("BACKUP_RETENTION_POLICY_INVALID");
  if (!policy.syntheticOnly || !policy.requireVerifiedRestoreBeforeRotation) throw new Error("BACKUP_ROTATION_GOVERNANCE_INVALID");
  if (!verifiedRestoreAvailable) return "BLOCK";
  if (retainedCount < 0) throw new Error("BACKUP_RETAINED_COUNT_INVALID");
  return "ALLOW";
}
