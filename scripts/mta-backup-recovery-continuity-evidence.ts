import { mkdir, writeFile } from "node:fs/promises";
import { assessBackupContinuity } from "../src/application/runtime-backup-continuity.js";
import type { BackupManifest } from "../src/application/runtime-adapters.js";
import { certifyRecoveryJourney } from "../src/application/recovery-certification.js";
import type { RecoveryEvidence } from "../src/application/recovery-evidence.js";
import type { RecoveryRetryRecord } from "../src/application/recovery-retry.js";

const previous: BackupManifest = Object.freeze({
  schemaVersion: 1,
  backupId: "BKP-SYN-0001",
  sourceRuntime: "LOCAL",
  sourceDeviceId: "DEV-SYN-0001",
  sourceInstallationId: "INST-SYN-0001",
  createdAt: "2026-09-22T02:00:00.000Z",
  payloadFingerprint: "FP-BKP-SYN-0001",
  syntheticOnly: true,
});

const current: BackupManifest = Object.freeze({
  schemaVersion: 1,
  backupId: "BKP-SYN-0002",
  sourceRuntime: "LOCAL",
  sourceDeviceId: "DEV-SYN-0001",
  sourceInstallationId: "INST-SYN-0001",
  createdAt: "2026-09-22T02:05:00.000Z",
  previousBackupId: previous.backupId,
  payloadFingerprint: "FP-BKP-SYN-0002",
  syntheticOnly: true,
});

const ready = assessBackupContinuity(current, previous);
if (ready.decision !== "READY" || !ready.chainValid) throw new Error("Valid backup chain did not become READY.");

const blocked = assessBackupContinuity(current);
if (blocked.decision !== "BLOCKED" || blocked.chainValid) throw new Error("Broken backup predecessor did not fail closed.");

const evidence: RecoveryEvidence = Object.freeze({
  commandId: "CMD-REC-SYN-0001",
  mutationCommitted: true,
  syntheticOnly: true,
});
const retryKey = "RETRY-SYN-0001";
const fingerprint = "FP-REC-SYN-0001";
const retries: RecoveryRetryRecord[] = [
  Object.freeze({ retryKey, commandId: evidence.commandId, sourceFingerprint: fingerprint, decision: "RETRY", syntheticOnly: true }),
  Object.freeze({ retryKey, commandId: evidence.commandId, sourceFingerprint: fingerprint, decision: "SKIP_DUPLICATE", syntheticOnly: true }),
];

const recovery = certifyRecoveryJourney({
  journeyId: "RECOVERY-SYN-0001",
  outcome: "COMMITTED",
  evidence: [evidence],
  retries,
  mutationCount: 1,
  auditCount: 1,
  outboxCount: 1,
});
if (!recovery.certified || recovery.retryCount !== 2) throw new Error("Recovery certification did not pass.");

await mkdir("artifacts/mta-evidence", { recursive: true });
await writeFile(
  "artifacts/mta-evidence/backup-recovery-continuity.json",
  JSON.stringify({
    executionId: process.env.GITHUB_RUN_ID ?? "local",
    commitSha: process.env.GITHUB_SHA ?? "local",
    environment: process.env.MTA_EXECUTION_ENV ?? "controlled-nonprod",
    syntheticOnly: true,
    productionAccessAuthorized: false,
    migrationExecuted: false,
    aiEnabled: false,
    backupContinuity: { ready, blockedMissingPredecessor: blocked },
    recoveryCertification: recovery,
    result: "PASS",
  }, null, 2) + "\n",
  "utf8",
);
console.log("BACKUP_RECOVERY_CONTINUITY=PASS");
