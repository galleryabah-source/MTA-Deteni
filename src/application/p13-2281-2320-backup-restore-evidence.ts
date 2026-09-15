export type BackupKind = "LOCAL" | "REMOTE";
export type RestoreVerification = "VERIFIED" | "FAILED" | "NOT_RUN";

export type BackupRestoreEvidence = Readonly<{
  evidenceId: string;
  backupId: string;
  kind: BackupKind;
  createdAt: string;
  sourceVersion: string;
  restoreVerification: RestoreVerification;
  syntheticOnly: true;
}>;

export function validateBackupRestoreEvidence(evidence: BackupRestoreEvidence): void {
  if (!evidence.evidenceId.trim() || !evidence.backupId.trim() || !evidence.sourceVersion.trim()) {
    throw new Error("BACKUP_EVIDENCE_IDENTITY_REQUIRED");
  }
  if (!evidence.createdAt.trim()) throw new Error("BACKUP_EVIDENCE_TIMESTAMP_REQUIRED");
  if (!evidence.syntheticOnly) throw new Error("BACKUP_EVIDENCE_SYNTHETIC_ONLY_REQUIRED");
}

export function assertRestoreVerified(evidence: BackupRestoreEvidence): void {
  validateBackupRestoreEvidence(evidence);
  if (evidence.restoreVerification !== "VERIFIED") {
    throw new Error("RESTORE_VERIFICATION_REQUIRED");
  }
}
