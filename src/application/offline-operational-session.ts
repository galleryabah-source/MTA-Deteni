import type { OfflineCommand, QueueState, ReconciliationDecision } from "./offline-continuity.js";
import type { RuntimeExecutionContext } from "./runtime-execution-boundary.js";
import type { BackupContinuityAssessment } from "./runtime-backup-continuity.js";
import type { RuntimeContinuityAssessment } from "./runtime-continuity-coordinator.js";
import type { ContinuityCertification } from "./continuity-certification.js";

export type OperationalSessionState = "ACTIVE" | "RECONCILIATION_REQUIRED" | "CLOSED" | "INTERRUPTED";
export type CommandAdmission = "ADMITTED" | "REJECTED";

export type OperationalSession = Readonly<{
  sessionId: string;
  executionId: string;
  deviceId: string;
  installationId: string;
  networkScopeId: string;
  runtimeMode: RuntimeExecutionContext["runtimeMode"];
  state: OperationalSessionState;
  syntheticOnly: true;
}>;

export type SessionCloseEvidence = Readonly<{
  evidenceId: string;
  sessionId: string;
  executionId: string;
  deviceId: string;
  installationId: string;
  networkScopeId: string;
  queueState: QueueState;
  backupReady: boolean;
  continuityCertificationId: string;
  clean: true;
  syntheticOnly: true;
}>;

export function openOperationalSession(input: {
  sessionId: string;
  context: RuntimeExecutionContext;
  deviceId: string;
  installationId: string;
}): OperationalSession {
  for (const value of [input.sessionId, input.context.executionId, input.context.networkScopeId, input.deviceId, input.installationId]) {
    if (!value.trim()) throw new Error("Operational session identity is required.");
  }
  if (!input.context.authenticated || !input.context.syntheticOnly) throw new Error("Operational session requires authenticated synthetic context.");
  return Object.freeze({ sessionId: input.sessionId, executionId: input.context.executionId, deviceId: input.deviceId, installationId: input.installationId, networkScopeId: input.context.networkScopeId, runtimeMode: input.context.runtimeMode, state: "ACTIVE", syntheticOnly: true });
}

export function assertSessionScope(session: OperationalSession, context: RuntimeExecutionContext, deviceId: string, installationId: string): void {
  if (session.executionId !== context.executionId) throw new Error("Operational session execution drift detected.");
  if (session.networkScopeId !== context.networkScopeId) throw new Error("Operational session network scope drift detected.");
  if (session.deviceId !== deviceId || session.installationId !== installationId) throw new Error("Operational session device scope drift detected.");
  if (!context.authenticated || !context.syntheticOnly || !session.syntheticOnly) throw new Error("Operational session authentication boundary is invalid.");
}

export function admitLocalCommand(input: { session: OperationalSession; context: RuntimeExecutionContext; deviceId: string; installationId: string; command: OfflineCommand }): CommandAdmission {
  assertSessionScope(input.session, input.context, input.deviceId, input.installationId);
  if (input.session.state !== "ACTIVE") throw new Error("Local command admission requires an active operational session.");
  if (!input.command.commandId.trim() || !input.command.aggregateId.trim() || !input.command.idempotencyKey.trim()) throw new Error("Local command identity is required.");
  if (input.command.state !== "PENDING") throw new Error("Local command admission requires a pending queue command.");
  return "ADMITTED";
}

export function assessSessionClose(input: {
  session: OperationalSession;
  context: RuntimeExecutionContext;
  deviceId: string;
  installationId: string;
  queue: readonly OfflineCommand[];
  reconciliation?: ReconciliationDecision;
  runtime: RuntimeContinuityAssessment;
  backup: BackupContinuityAssessment;
  continuity: ContinuityCertification;
}): SessionCloseEvidence {
  assertSessionScope(input.session, input.context, input.deviceId, input.installationId);
  if (input.session.state !== "ACTIVE" && input.session.state !== "RECONCILIATION_REQUIRED") throw new Error("Operational session is not closable.");
  if (input.continuity.executionId !== input.session.executionId || input.continuity.certificationId.trim() === "") throw new Error("Session close continuity binding mismatch.");
  if (input.runtime.decision !== "READY" || input.runtime.queueState !== "SYNCED") throw new Error("Session close requires reconciled runtime continuity.");
  if (input.backup.decision !== "READY") throw new Error("Session close requires ready backup continuity.");
  if (input.reconciliation?.action === "REVIEW_CONFLICT") throw new Error("Session close is blocked by unresolved reconciliation conflict.");
  if (input.queue.some((item) => item.state !== "SYNCED")) throw new Error("Session close requires every queued command to be synchronized.");
  if (input.continuity.journeyId !== input.context.certificationJourneyId) throw new Error("Session close certification journey drift detected.");
  return Object.freeze({ evidenceId: `SESSION-CLOSE-${input.session.sessionId}`, sessionId: input.session.sessionId, executionId: input.session.executionId, deviceId: input.session.deviceId, installationId: input.session.installationId, networkScopeId: input.session.networkScopeId, queueState: "SYNCED", backupReady: true, continuityCertificationId: input.continuity.certificationId, clean: true, syntheticOnly: true });
}

export function closeOperationalSession(session: OperationalSession, evidence: SessionCloseEvidence): OperationalSession {
  if (evidence.sessionId !== session.sessionId || evidence.executionId !== session.executionId || !evidence.clean || !evidence.syntheticOnly) throw new Error("Clean session-close evidence does not match session.");
  return Object.freeze({ ...session, state: "CLOSED" });
}

export function interruptOperationalSession(session: OperationalSession): OperationalSession {
  if (session.state === "CLOSED") throw new Error("Closed operational session cannot be interrupted.");
  return Object.freeze({ ...session, state: "INTERRUPTED" });
}

export function requireCleanHandoff(session: OperationalSession): void {
  if (session.state !== "CLOSED") throw new Error("Interrupted or active operational session cannot be treated as a clean handoff.");
}
