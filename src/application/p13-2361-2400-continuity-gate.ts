import type { BackupRestoreEvidence } from "./p13-2281-2320-backup-restore-evidence.js";
import type { MultiDeviceAcceptance } from "./p13-2321-2360-multi-device-acceptance.js";

export type ContinuityGateDecision = "BLOCKED" | "READY";

export type ContinuityGateInput = Readonly<{
  runtimePackaged: boolean;
  queueIntegrityCertified: boolean;
  backupRestore: BackupRestoreEvidence;
  multiDeviceAcceptance: MultiDeviceAcceptance;
  productionAuthorized: false;
  migrationFreeze: true;
}>;

export function evaluateContinuityGate(input: ContinuityGateInput): ContinuityGateDecision {
  if (!input.runtimePackaged || !input.queueIntegrityCertified) return "BLOCKED";
  if (input.productionAuthorized !== false || input.migrationFreeze !== true) return "BLOCKED";
  if (input.backupRestore.restoreVerification !== "VERIFIED") return "BLOCKED";
  if (input.multiDeviceAcceptance.devices.length === 0) return "BLOCKED";
  return "READY";
}
