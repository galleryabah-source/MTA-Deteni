export type ContinuityEvidence = Readonly<{
  controlId: string;
  executionId: string;
  commitSha: string;
  environment: "controlled-nonprod";
  occurredAt: string;
  result: "PASS" | "FAIL" | "REVIEW";
  evidenceFingerprint: string;
}>;

function fingerprint(material: string): string {
  let h = 2166136261;
  for (let i = 0; i < material.length; i += 1) {
    h ^= material.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16).padStart(8, "0");
}

export function createContinuityEvidence(input: Omit<ContinuityEvidence, "evidenceFingerprint">): ContinuityEvidence {
  const material = [input.controlId, input.executionId, input.commitSha, input.environment, input.occurredAt, input.result].join("|");
  return { ...input, evidenceFingerprint: fingerprint(material) };
}

export function assertContinuityEvidence(evidence: ContinuityEvidence): void {
  const { evidenceFingerprint, ...input } = evidence;
  const expected = createContinuityEvidence(input).evidenceFingerprint;
  if (expected !== evidenceFingerprint) throw new Error("Continuity evidence fingerprint mismatch.");
  if (!evidence.controlId.trim() || !evidence.executionId.trim() || !evidence.commitSha.trim()) {
    throw new Error("Continuity evidence requires control, execution and commit identity.");
  }
}

export type BackupIdentity = Readonly<{
  backupId: string;
  sourceRuntime: "LAN" | "LOCAL";
  sourceDeviceId: string;
  createdAt: string;
  manifestFingerprint: string;
  syntheticOnly: true;
}>;

export type RestoreIdentity = Readonly<{
  restoreId: string;
  backupId: string;
  targetRuntime: "LAN" | "LOCAL";
  targetDeviceId: string;
  restoredAt: string;
  result: "RESTORED" | "REJECTED" | "REVIEW";
}>;

export function assertBackupRestoreChain(backup: BackupIdentity, restore: RestoreIdentity): void {
  if (!backup.syntheticOnly) throw new Error("Backup must remain synthetic-only in this phase.");
  if (restore.backupId !== backup.backupId) throw new Error("Restore must reference the exact backup identity.");
  if (!backup.sourceDeviceId.trim() || !restore.targetDeviceId.trim()) throw new Error("Backup/restore device identity is required.");
}
