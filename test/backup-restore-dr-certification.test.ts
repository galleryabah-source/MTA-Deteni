import assert from "node:assert/strict";
import test from "node:test";
import type { BackupManifest } from "../src/application/runtime-adapters.js";
import {
  BACKUP_RESTORE_DR_CERTIFICATION_VERSION,
  certifyBackupRestoreDisasterRecovery,
  createSyntheticBackupArtifact,
  restoreSyntheticBackup,
} from "../src/application/backup-restore-dr-certification.js";

const previous: BackupManifest = Object.freeze({
  schemaVersion: 1,
  backupId: "BKP-DR-SYN-0001",
  sourceRuntime: "LOCAL",
  sourceDeviceId: "DEV-DR-SYN-001",
  sourceInstallationId: "INST-DR-SYN-001",
  createdAt: "2026-09-26T00:00:00.000Z",
  payloadFingerprint: "FP-PREVIOUS",
  syntheticOnly: true,
});

const current: BackupManifest = Object.freeze({
  schemaVersion: 1,
  backupId: "BKP-DR-SYN-0002",
  sourceRuntime: "LOCAL",
  sourceDeviceId: "DEV-DR-SYN-001",
  sourceInstallationId: "INST-DR-SYN-001",
  createdAt: "2026-09-26T00:01:00.000Z",
  previousBackupId: previous.backupId,
  payloadFingerprint: "FP-CURRENT",
  syntheticOnly: true,
});

const payload = "MTA-DETENI-SYNTHETIC-BACKUP-PAYLOAD-v1";

function fixture() {
  const artifact = createSyntheticBackupArtifact({
    manifest: current,
    payload,
    auditCount: 12,
    outboxCount: 12,
    evidenceCount: 3,
  });
  const restored = restoreSyntheticBackup({
    artifact,
    sourcePayload: payload,
    completedAt: "2026-09-26T00:04:00.000Z",
  });
  return { artifact, restored };
}

test("backup restore and disaster recovery certification passes the canonical synthetic journey", () => {
  const { artifact, restored } = fixture();
  const result = certifyBackupRestoreDisasterRecovery({
    previous,
    current: artifact,
    restored,
    payload,
    lastSourceChangeAt: "2026-09-25T23:58:00.000Z",
    backupCreatedAt: current.createdAt,
    restoreStartedAt: "2026-09-26T00:02:00.000Z",
    recoveryCompletedAt: restored.completedAt,
    rpoTargetMinutes: 5,
    rtoTargetMinutes: 5,
  });
  assert.equal(result.version, BACKUP_RESTORE_DR_CERTIFICATION_VERSION);
  assert.equal(result.backupChainCertified, true);
  assert.equal(result.backupIntegrityCertified, true);
  assert.equal(result.restoreIntegrityCertified, true);
  assert.equal(result.rpoCertified, true);
  assert.equal(result.rtoCertified, true);
  assert.equal(result.disasterRecoveryCertified, true);
  assert.equal(result.syntheticOnly, true);
  assert.equal(result.productionAccessAuthorized, false);
  assert.equal(result.migrationExecuted, false);
});

test("restore fails closed when payload integrity changes", () => {
  const { artifact } = fixture();
  assert.throws(
    () => restoreSyntheticBackup({ artifact, sourcePayload: payload + "-TAMPERED", completedAt: "2026-09-26T00:04:00.000Z" }),
    /BACKUP_DR_PAYLOAD_INTEGRITY_MISMATCH/,
  );
});

test("certification fails closed on broken backup predecessor", () => {
  const { artifact, restored } = fixture();
  const wrongPrevious = Object.freeze({ ...previous, backupId: "BKP-DR-SYN-WRONG" });
  assert.throws(
    () => certifyBackupRestoreDisasterRecovery({
      previous: wrongPrevious,
      current: artifact,
      restored,
      payload,
      backupCreatedAt: current.createdAt,
      recoveryCompletedAt: restored.completedAt,
      rpoTargetMinutes: 5,
      rtoTargetMinutes: 5,
    }),
    /Backup chain reference mismatch/,
  );
});

test("certification fails closed when RPO or RTO target is breached", () => {
  const { artifact, restored } = fixture();
  assert.throws(
    () => certifyBackupRestoreDisasterRecovery({
      previous,
      current: artifact,
      restored,
      payload,
      lastSourceChangeAt: "2026-09-25T23:50:00.000Z",
      backupCreatedAt: current.createdAt,
      restoreStartedAt: "2026-09-26T00:02:00.000Z",
      recoveryCompletedAt: "2026-09-26T00:10:01.000Z",
      rpoTargetMinutes: 5,
      rtoTargetMinutes: 5,
    }),
    /BACKUP_DR_RPO_BREACH/,
  );
});
