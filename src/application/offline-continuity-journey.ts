import type { OfflineCommand } from "./offline-continuity.js";
import { openOperationalSession, admitLocalCommand, markSessionReconciliationRequired, assessSessionClose, closeOperationalSession, type OperationalSession } from "./offline-operational-session.js";
import { createReconciliationReceipt, certifySessionReconciliation, markSessionReconciliationComplete } from "./session-reconciliation.js";
import { assessRuntimeContinuity } from "./runtime-continuity-coordinator.js";
import { assessBackupContinuity } from "./runtime-backup-continuity.js";
import { certifyContinuity, assertContinuityCertification } from "./continuity-certification.js";
import type { RuntimeExecutionContext } from "./runtime-execution-boundary.js";
import type { LifecycleCertification } from "./lifecycle-certification.js";
import type { RecoveryCertification } from "./recovery-certification.js";

export type OfflineContinuityJourneyResult = Readonly<{
  session: OperationalSession;
  admittedCommands: readonly OfflineCommand[];
  reconciledCommands: readonly OfflineCommand[];
  receiptIds: readonly string[];
  continuityCertificationId: string;
  cleanCloseEvidenceId: string;
  clean: true;
  syntheticOnly: true;
}>;

export function executeOfflineContinuityJourney(input: { sessionId: string; context: RuntimeExecutionContext; deviceId: string; installationId: string; commands: readonly OfflineCommand[]; lifecycle: LifecycleCertification; recovery: RecoveryCertification; backupManifest: Parameters<typeof assessBackupContinuity>[0] }): OfflineContinuityJourneyResult {
  if (input.commands.length === 0) throw new Error("Offline continuity journey requires at least one admitted command.");
  const opened = openOperationalSession({ sessionId: input.sessionId, context: input.context, deviceId: input.deviceId, installationId: input.installationId });
  for (const command of input.commands) admitLocalCommand({ session: opened, context: input.context, deviceId: input.deviceId, installationId: input.installationId, command });
  const reconciliationSession = markSessionReconciliationRequired(opened);
  const decisions = input.commands.map((command) => ({ command, decision: { commandId: command.commandId, action: "APPLY" as const } }));
  const receipts = decisions.map(({ command, decision }) => createReconciliationReceipt({ session: reconciliationSession, context: input.context, command, decision }));
  const proof = certifySessionReconciliation({ session: reconciliationSession, context: input.context, admittedCommands: input.commands, receipts });
  const active = markSessionReconciliationComplete(reconciliationSession, proof);
  const reconciledCommands = input.commands.map((command) => Object.freeze({ ...command, state: "SYNCED" as const }));
  const runtime = assessRuntimeContinuity({ context: input.context, queue: reconciledCommands });
  const backup = assessBackupContinuity(input.backupManifest);
  const continuity = certifyContinuity({ certificationId: `CONT-${input.sessionId}`, context: input.context, lifecycle: input.lifecycle, recovery: input.recovery, runtime, backup });
  assertContinuityCertification(continuity);
  const closeEvidence = assessSessionClose({ session: active, context: input.context, deviceId: input.deviceId, installationId: input.installationId, queue: reconciledCommands, runtime, backup, continuity });
  const closed = closeOperationalSession(active, closeEvidence);
  return Object.freeze({ session: closed, admittedCommands: Object.freeze([...input.commands]), reconciledCommands: Object.freeze([...reconciledCommands]), receiptIds: proof.receiptIds, continuityCertificationId: continuity.certificationId, cleanCloseEvidenceId: closeEvidence.evidenceId, clean: true, syntheticOnly: true });
}
