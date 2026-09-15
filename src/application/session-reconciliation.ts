import type { OfflineCommand, ReconciliationDecision } from "./offline-continuity.js";
import type { OperationalSession } from "./offline-operational-session.js";
import type { RuntimeExecutionContext } from "./runtime-execution-boundary.js";

export type ReconciliationReceipt = Readonly<{
  receiptId: string;
  sessionId: string;
  executionId: string;
  commandId: string;
  action: ReconciliationDecision["action"];
  resultingState: "SYNCED";
  syntheticOnly: true;
}>;

export type SessionReconciliationProof = Readonly<{
  sessionId: string;
  executionId: string;
  admittedCount: number;
  reconciledCount: number;
  receiptIds: readonly string[];
  complete: true;
  syntheticOnly: true;
}>;

export function createReconciliationReceipt(input: { session: OperationalSession; context: RuntimeExecutionContext; command: OfflineCommand; decision: ReconciliationDecision }): ReconciliationReceipt {
  if (input.session.state === "CLOSED" || input.session.state === "INTERRUPTED") throw new Error("Reconciliation cannot complete for a closed or interrupted session.");
  if (!input.context.authenticated || !input.context.syntheticOnly) throw new Error("Reconciliation requires authenticated synthetic context.");
  if (input.session.executionId !== input.context.executionId) throw new Error("Reconciliation execution identity drift detected.");
  if (input.decision.commandId !== input.command.commandId) throw new Error("Reconciliation receipt command identity mismatch.");
  if (input.decision.action === "REVIEW_CONFLICT") throw new Error("Conflict review cannot produce a completed reconciliation receipt.");
  return Object.freeze({ receiptId: `RECON-${input.session.sessionId}-${input.command.commandId}`, sessionId: input.session.sessionId, executionId: input.session.executionId, commandId: input.command.commandId, action: input.decision.action, resultingState: "SYNCED", syntheticOnly: true });
}

export function certifySessionReconciliation(input: { session: OperationalSession; context: RuntimeExecutionContext; admittedCommands: readonly OfflineCommand[]; receipts: readonly ReconciliationReceipt[] }): SessionReconciliationProof {
  if (input.session.state === "CLOSED" || input.session.state === "INTERRUPTED") throw new Error("Session reconciliation proof cannot complete after session termination.");
  if (!input.context.authenticated || !input.context.syntheticOnly) throw new Error("Reconciliation proof requires authenticated synthetic context.");
  if (input.session.executionId !== input.context.executionId) throw new Error("Reconciliation proof execution identity drift detected.");
  if (input.receipts.length !== input.admittedCommands.length) throw new Error("Reconciliation proof is incomplete.");
  const commandIds = new Set(input.admittedCommands.map((command) => command.commandId));
  const receiptIds = new Set<string>();
  for (const receipt of input.receipts) {
    if (receipt.sessionId !== input.session.sessionId || receipt.executionId !== input.session.executionId || !receipt.syntheticOnly || receipt.resultingState !== "SYNCED") throw new Error("Reconciliation receipt binding is invalid.");
    if (!commandIds.has(receipt.commandId) || receiptIds.has(receipt.receiptId)) throw new Error("Reconciliation receipt does not uniquely cover the admitted queue.");
    receiptIds.add(receipt.receiptId);
  }
  if (receiptIds.size !== commandIds.size) throw new Error("Reconciliation proof does not cover every admitted command.");
  return Object.freeze({ sessionId: input.session.sessionId, executionId: input.session.executionId, admittedCount: input.admittedCommands.length, reconciledCount: input.receipts.length, receiptIds: Object.freeze([...receiptIds]), complete: true, syntheticOnly: true });
}

export function markSessionReconciliationComplete(session: OperationalSession, proof: SessionReconciliationProof): OperationalSession {
  if (proof.sessionId !== session.sessionId || proof.executionId !== session.executionId || !proof.complete || !proof.syntheticOnly || proof.admittedCount !== proof.reconciledCount) throw new Error("Session reconciliation proof does not match session.");
  if (session.state === "CLOSED" || session.state === "INTERRUPTED") throw new Error("Terminated session cannot become reconciliation-complete.");
  return Object.freeze({ ...session, state: "ACTIVE" });
}
