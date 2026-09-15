import type { OfflineCommand, ReconciliationDecision } from "./offline-continuity.js";
import { applyReconnectTransition, createReconnectTransition } from "./runtime-adapters.js";
import type { RuntimeExecutionContext } from "./runtime-execution-boundary.js";
import type { OperationalSession } from "./offline-operational-session.js";
import { assertSessionScope, markSessionReconciliationRequired } from "./offline-operational-session.js";

export type InterruptedSessionRecord = Readonly<{
  recordId: string;
  sessionId: string;
  executionId: string;
  deviceId: string;
  installationId: string;
  networkScopeId: string;
  admittedCommandIds: readonly string[];
  reconciledCommandIds: readonly string[];
  lastCommandId?: string;
  interruptedAt: string;
  reason: string;
  syntheticOnly: true;
}>;

export type ReconnectAuthorization = Readonly<{
  authorizationId: string;
  sessionId: string;
  executionId: string;
  deviceId: string;
  installationId: string;
  networkScopeId: string;
  authorizedAt: string;
  syntheticOnly: true;
}>;

export type ReconnectRecovery = Readonly<{
  record: InterruptedSessionRecord;
  authorization: ReconnectAuthorization;
  session: OperationalSession;
  rehydratedCommands: readonly OfflineCommand[];
  state: "RECONCILIATION_REQUIRED";
  syntheticOnly: true;
}>;

export function captureInterruptedSession(input: {
  session: OperationalSession;
  context: RuntimeExecutionContext;
  deviceId: string;
  installationId: string;
  admittedCommands: readonly OfflineCommand[];
  reconciledCommands?: readonly OfflineCommand[];
  interruptedAt: string;
  reason: string;
}): InterruptedSessionRecord {
  assertSessionScope(input.session, input.context, input.deviceId, input.installationId);
  if (input.session.state !== "ACTIVE" && input.session.state !== "RECONCILIATION_REQUIRED") throw new Error("Only an open session can be interrupted.");
  if (!input.interruptedAt.trim() || !input.reason.trim()) throw new Error("Interruption evidence requires timestamp and reason.");
  const admittedCommandIds = input.admittedCommands.map((command) => command.commandId);
  const reconciledCommandIds = (input.reconciledCommands ?? []).map((command) => command.commandId);
  if (new Set(admittedCommandIds).size !== admittedCommandIds.length) throw new Error("Interrupted session contains duplicate admitted command identity.");
  if (reconciledCommandIds.some((id) => !admittedCommandIds.includes(id))) throw new Error("Interrupted session reconciliation boundary exceeds admitted command boundary.");
  return Object.freeze({ recordId: `INT-${input.session.sessionId}`, sessionId: input.session.sessionId, executionId: input.session.executionId, deviceId: input.session.deviceId, installationId: input.session.installationId, networkScopeId: input.session.networkScopeId, admittedCommandIds: Object.freeze([...admittedCommandIds]), reconciledCommandIds: Object.freeze([...reconciledCommandIds]), lastCommandId: admittedCommandIds.at(-1), interruptedAt: input.interruptedAt, reason: input.reason, syntheticOnly: true });
}

export function authorizeReconnect(input: { record: InterruptedSessionRecord; context: RuntimeExecutionContext; session: OperationalSession; deviceId: string; installationId: string; authorizationId: string; authorizedAt: string }): ReconnectAuthorization {
  if (!input.authorizationId.trim() || !input.authorizedAt.trim()) throw new Error("Reconnect authorization identity is required.");
  assertSessionScope(input.session, input.context, input.deviceId, input.installationId);
  if (input.session.state !== "INTERRUPTED") throw new Error("Reconnect authorization requires an interrupted session.");
  if (input.record.sessionId !== input.session.sessionId || input.record.executionId !== input.session.executionId || input.record.deviceId !== input.deviceId || input.record.installationId !== input.installationId || input.record.networkScopeId !== input.context.networkScopeId) throw new Error("Reconnect authorization identity drift detected.");
  return Object.freeze({ authorizationId: input.authorizationId, sessionId: input.session.sessionId, executionId: input.session.executionId, deviceId: input.deviceId, installationId: input.installationId, networkScopeId: input.context.networkScopeId, authorizedAt: input.authorizedAt, syntheticOnly: true });
}

export function recoverInterruptedSession(input: { record: InterruptedSessionRecord; authorization: ReconnectAuthorization; session: OperationalSession; context: RuntimeExecutionContext; deviceId: string; installationId: string; queuedCommands: readonly OfflineCommand[] }): ReconnectRecovery {
  assertSessionScope(input.session, input.context, input.deviceId, input.installationId);
  if (input.session.state !== "INTERRUPTED") throw new Error("Recovery requires an interrupted session.");
  if (input.authorization.sessionId !== input.session.sessionId || input.authorization.executionId !== input.context.executionId || input.authorization.deviceId !== input.deviceId || input.authorization.installationId !== input.installationId || input.authorization.networkScopeId !== input.context.networkScopeId) throw new Error("Reconnect authorization scope drift detected.");
  if (input.record.sessionId !== input.session.sessionId || input.record.executionId !== input.context.executionId || input.record.deviceId !== input.deviceId || input.record.installationId !== input.installationId || input.record.networkScopeId !== input.context.networkScopeId) throw new Error("Interrupted record scope drift detected.");
  const expected = new Set(input.record.admittedCommandIds);
  if (input.queuedCommands.some((command) => !expected.has(command.commandId))) throw new Error("Rehydrated queue contains command outside the interrupted admission boundary.");
  if (input.queuedCommands.length !== expected.size) throw new Error("Rehydrated queue does not cover the interrupted admission boundary.");
  const rehydratedCommands = Object.freeze(input.queuedCommands.map((command) => Object.freeze({ ...command, state: "SYNCING" as const })));
  const reconciled = markSessionReconciliationRequired(input.session);
  return Object.freeze({ record: input.record, authorization: input.authorization, session: reconciled, rehydratedCommands, state: "RECONCILIATION_REQUIRED", syntheticOnly: true });
}

export function reconcileRecoveredCommand(input: { command: OfflineCommand; decision: ReconciliationDecision }): OfflineCommand {
  const transition = createReconnectTransition(input.command, input.decision);
  return applyReconnectTransition(input.command, transition);
}
