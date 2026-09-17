import type { OfflineCommand } from "./offline-continuity.js";
import { openOperationalSession, admitLocalCommand, assessSessionClose, closeOperationalSession, interruptOperationalSession, type OperationalSession } from "./offline-operational-session.js";
import { createReconciliationReceipt, certifySessionReconciliation, markSessionReconciliationComplete } from "./session-reconciliation.js";
import { assessRuntimeContinuity } from "./runtime-continuity-coordinator.js";
import { assessBackupContinuity } from "./runtime-backup-continuity.js";
import { certifyContinuity, assertContinuityCertification } from "./continuity-certification.js";
import { captureInterruptedSession, authorizeReconnect, recoverInterruptedSession, reconcileRecoveredCommand } from "./offline-session-recovery.js";
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
  interruptionRecordId: string;
  reconnectAuthorizationId: string;
  clean: true;
  syntheticOnly: true;
}>;

export function executeOfflineContinuityJourney(input: { sessionId: string; context: RuntimeExecutionContext; deviceId: string; installationId: string; commands: readonly OfflineCommand[]; lifecycle: LifecycleCertification; recovery: RecoveryCertification; backupManifest: Parameters<typeof assessBackupContinuity>[0] }): OfflineContinuityJourneyResult {
  if (input.commands.length === 0) throw new Error("Offline continuity journey requires at least one admitted command.");
  const opened = openOperationalSession({ sessionId: input.sessionId, context: input.context, deviceId: input.deviceId, installationId: input.installationId });
  for (const command of input.commands) admitLocalCommand({ session: opened, context: input.context, deviceId: input.deviceId, installationId: input.installationId, command });

  const interruptedRecord = captureInterruptedSession({ session: opened, context: input.context, deviceId: input.deviceId, installationId: input.installationId, admittedCommands: input.commands, interruptedAt: "2026-09-16T00:02:00Z", reason: "SYNTHETIC_NETWORK_INTERRUPTION" });
  const interrupted = interruptOperationalSession(opened);
  const authorization = authorizeReconnect({ record: interruptedRecord, context: input.context, session: interrupted, deviceId: input.deviceId, installationId: input.installationId, authorizationId: `AUTH-${input.sessionId}`, authorizedAt: "2026-09-16T00:03:00Z" });
  const recovered = recoverInterruptedSession({ record: interruptedRecord, authorization, session: interrupted, context: input.context, deviceId: input.deviceId, installationId: input.installationId, queuedCommands: input.commands });

  const decisions = recovered.rehydratedCommands.map((command, index) => ({ command, decision: { commandId: command.commandId, action: index === 0 ? "APPLY" as const : "SKIP_DUPLICATE" as const } }));
  const receipts = decisions.map(({ command, decision }) => createReconciliationReceipt({ session: recovered.session, context: input.context, command: Object.freeze({ ...command, state: "PENDING" as const }), decision }));
  const proof = certifySessionReconciliation({ session: recovered.session, context: input.context, admittedCommands: input.commands, receipts });
  const active = markSessionReconciliationComplete(recovered.session, proof);
  const reconciledCommands = Object.freeze(decisions.map(({ command, decision }) => reconcileRecoveredCommand({ command, decision })));
  const runtime = assessRuntimeContinuity({ context: input.context, queue: reconciledCommands });
  const backup = assessBackupContinuity(input.backupManifest);
  const continuity = certifyContinuity({ certificationId: `CONT-${input.sessionId}`, sessionId: input.sessionId, deviceId: input.deviceId, installationId: input.installationId, context: input.context, lifecycle: input.lifecycle, recovery: input.recovery, runtime, backup });
  assertContinuityCertification(continuity);
  const closeEvidence = assessSessionClose({ session: active, context: input.context, deviceId: input.deviceId, installationId: input.installationId, queue: reconciledCommands, runtime, backup, continuity });
  const closed = closeOperationalSession(active, closeEvidence);
  return Object.freeze({ session: closed, admittedCommands: Object.freeze([...input.commands]), reconciledCommands, receiptIds: proof.receiptIds, continuityCertificationId: continuity.certificationId, cleanCloseEvidenceId: closeEvidence.evidenceId, interruptionRecordId: interruptedRecord.recordId, reconnectAuthorizationId: authorization.authorizationId, clean: true, syntheticOnly: true });
}
