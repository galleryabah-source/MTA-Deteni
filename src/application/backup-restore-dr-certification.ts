import { createHash } from "node:crypto";
import { assertBackupChain, assertBackupManifest, type BackupManifest } from "./runtime-adapters.js";

export const BACKUP_RESTORE_DR_CERTIFICATION_VERSION = "BACKUP-RESTORE-DR-CERTIFICATION-v1";

export type BackupArtifact = Readonly<{
  manifest: BackupManifest;
  payloadHash: string;
  auditCount: number;
  outboxCount: number;
  evidenceCount: number;
  syntheticOnly: true;
}>;

export type RestoreResult = Readonly<{
  backupId: string;
  restoredPayloadHash: string;
  restoredAuditCount: number;
  restoredOutboxCount: number;
  restoredEvidenceCount: number;
  completedAt: string;
  syntheticOnly: true;
}>;

export type BackupRestoreDrCertification = Readonly<{
  version: typeof BACKUP_RESTORE_DR_CERTIFICATION_VERSION;
  backupChainCertified: true;
  backupIntegrityCertified: true;
  restoreIntegrityCertified: true;
  rpoMinutes: number;
  rpoTargetMinutes: number;
  rtoMinutes: number;
  rtoTargetMinutes: number;
  rpoCertified: true;
  rtoCertified: true;
  disasterRecoveryCertified: true;
  syntheticOnly: true;
  productionAccessAuthorized: false;
  migrationExecuted: false;
}>;

function assertNonBlank(value: string, code: string): void {
  if (!value.trim()) throw new Error(code);
}

function minutesBetween(start: string, end: string): number {
  const delta = Date.parse(end) - Date.parse(start);
  if (!Number.isFinite(delta) || delta < 0) throw new Error("BACKUP_DR_INVALID_TIME_WINDOW");
  return delta / 60000;
}

export function fingerprintPayload(payload: string): string {
  assertNonBlank(payload, "BACKUP_DR_PAYLOAD_REQUIRED");
  return createHash("sha256").update(payload).digest("hex");
}

export function createSyntheticBackupArtifact(input: {
  manifest: BackupManifest;
  payload: string;
  auditCount: number;
  outboxCount: number;
  evidenceCount: number;
}): BackupArtifact {
  assertBackupManifest(input.manifest);
  for (const [name, value] of [["auditCount", input.auditCount], ["outboxCount", input.outboxCount], ["evidenceCount", input.evidenceCount] as const]) {
    if (!Number.isInteger(value) || value < 0) throw new Error(`BACKUP_DR_INVALID_CARDINALITY:${name}`);
  }
  return Object.freeze({
    manifest: input.manifest,
    payloadHash: fingerprintPayload(input.payload),
    auditCount: input.auditCount,
    outboxCount: input.outboxCount,
    evidenceCount: input.evidenceCount,
    syntheticOnly: true,
  });
}

export function assertBackupArtifactIntegrity(artifact: BackupArtifact): void {
  assertBackupManifest(artifact.manifest);
  assertNonBlank(artifact.payloadHash, "BACKUP_DR_PAYLOAD_HASH_REQUIRED");
  if (artifact.syntheticOnly !== true) throw new Error("BACKUP_DR_SYNTHETIC_ONLY_REQUIRED");
  if (![artifact.auditCount, artifact.outboxCount, artifact.evidenceCount].every((value) => Number.isInteger(value) && value >= 0)) {
    throw new Error("BACKUP_DR_INVALID_CARDINALITY");
  }
}

export function restoreSyntheticBackup(input: {
  artifact: BackupArtifact;
  sourcePayload: string;
  completedAt: string;
}): RestoreResult {
  assertBackupArtifactIntegrity(input.artifact);
  const actualHash = fingerprintPayload(input.sourcePayload);
  if (actualHash !== input.artifact.payloadHash) throw new Error("BACKUP_DR_PAYLOAD_INTEGRITY_MISMATCH");
  return Object.freeze({
    backupId: input.artifact.manifest.backupId,
    restoredPayloadHash: actualHash,
    restoredAuditCount: input.artifact.auditCount,
    restoredOutboxCount: input.artifact.outboxCount,
    restoredEvidenceCount: input.artifact.evidenceCount,
    completedAt: input.completedAt,
    syntheticOnly: true,
  });
}

export function certifyBackupRestoreDisasterRecovery(input: {
  previous: BackupManifest;
  current: BackupArtifact;
  restored: RestoreResult;
  payload: string;
  lastSourceChangeAt: string;
  backupCreatedAt: string;
  restoreStartedAt: string;
  recoveryCompletedAt: string;
  rpoTargetMinutes: number;
  rtoTargetMinutes: number;
}): BackupRestoreDrCertification {
  assertBackupManifest(input.previous);
  assertBackupArtifactIntegrity(input.current);
  assertBackupChain(input.previous, input.current.manifest);

  if (input.restored.backupId !== input.current.manifest.backupId) throw new Error("BACKUP_DR_RESTORE_BACKUP_ID_MISMATCH");
  if (input.restored.restoredPayloadHash !== input.current.payloadHash) throw new Error("BACKUP_DR_RESTORE_PAYLOAD_HASH_MISMATCH");
  if (input.restored.restoredAuditCount !== input.current.auditCount || input.restored.restoredOutboxCount !== input.current.outboxCount || input.restored.restoredEvidenceCount !== input.current.evidenceCount) {
    throw new Error("BACKUP_DR_RESTORE_CARDINALITY_MISMATCH");
  }
  if (fingerprintPayload(input.payload) !== input.current.payloadHash) throw new Error("BACKUP_DR_SOURCE_PAYLOAD_MISMATCH");
  if (![input.rpoTargetMinutes, input.rtoTargetMinutes].every((value) => Number.isFinite(value) && value >= 0)) throw new Error("BACKUP_DR_TARGET_INVALID");

  const rpoMinutes = minutesBetween(input.lastSourceChangeAt, input.backupCreatedAt);
  const rtoMinutes = minutesBetween(input.restoreStartedAt, input.recoveryCompletedAt);
  if (rpoMinutes > input.rpoTargetMinutes) throw new Error("BACKUP_DR_RPO_BREACH");
  if (rtoMinutes > input.rtoTargetMinutes) throw new Error("BACKUP_DR_RTO_BREACH");

  return Object.freeze({
    version: BACKUP_RESTORE_DR_CERTIFICATION_VERSION,
    backupChainCertified: true,
    backupIntegrityCertified: true,
    restoreIntegrityCertified: true,
    rpoMinutes,
    rpoTargetMinutes: input.rpoTargetMinutes,
    rtoMinutes,
    rtoTargetMinutes: input.rtoTargetMinutes,
    rpoCertified: true,
    rtoCertified: true,
    disasterRecoveryCertified: true,
    syntheticOnly: true,
    productionAccessAuthorized: false,
    migrationExecuted: false,
  });
}
