import type { BackupManifest } from "./runtime-adapters.js";
import { assertBackupChain, assertBackupManifest } from "./runtime-adapters.js";

export type BackupContinuityDecision = "READY" | "CHAIN_REQUIRED" | "BLOCKED";

export type BackupContinuityAssessment = Readonly<{
  backupId: string;
  previousBackupId?: string | undefined;
  sourceRuntime: BackupManifest["sourceRuntime"];
  sourceDeviceId: string;
  sourceInstallationId: string;
  chainValid: boolean;
  decision: BackupContinuityDecision;
  syntheticOnly: true;
}>;

export function assessBackupContinuity(current: BackupManifest, previous?: BackupManifest): BackupContinuityAssessment {
  assertBackupManifest(current);
  if (previous) {
    assertBackupChain(previous, current);
    return Object.freeze({ backupId: current.backupId, previousBackupId: current.previousBackupId, sourceRuntime: current.sourceRuntime, sourceDeviceId: current.sourceDeviceId, sourceInstallationId: current.sourceInstallationId, chainValid: true, decision: "READY", syntheticOnly: true });
  }
  const decision: BackupContinuityDecision = current.previousBackupId ? "BLOCKED" : "READY";
  return Object.freeze({ backupId: current.backupId, previousBackupId: current.previousBackupId, sourceRuntime: current.sourceRuntime, sourceDeviceId: current.sourceDeviceId, sourceInstallationId: current.sourceInstallationId, chainValid: decision === "READY", decision, syntheticOnly: true });
}

export function assertBackupContinuityAssessment(input: BackupContinuityAssessment): void {
  if (!input.backupId.trim() || !input.sourceDeviceId.trim() || !input.sourceInstallationId.trim() || !input.syntheticOnly) throw new Error("Backup continuity assessment is invalid.");
  if (input.decision === "READY" && !input.chainValid) throw new Error("Ready backup continuity must have a valid chain.");
  if (input.decision === "BLOCKED" && input.chainValid) throw new Error("Blocked backup continuity cannot claim a valid chain.");
}
