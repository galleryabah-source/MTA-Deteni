import type { FailureRecoveryCase, RecoveryClassification, FailureTerminalState } from "./failure-recovery-contract.js";
import { assertFailureRecoveryCase } from "./failure-recovery-contract.js";

export type RecoveryEvidence = Readonly<{
  evidenceId: string;
  commandId: string;
  eventId: string;
  correlationId: string;
  aggregateId: string;
  expectedVersion: number;
  resultingVersion: number;
  failureClass: FailureRecoveryCase["failureClass"];
  reasonCode: string;
  terminalState: FailureTerminalState;
  recovery: RecoveryClassification;
  mutationCommitted: boolean;
  retrySafe: boolean;
  compensationAllowed: boolean;
  syntheticOnly: true;
}>;

export function createRecoveryEvidence(input: Omit<RecoveryEvidence, "syntheticOnly">): RecoveryEvidence {
  for (const value of [input.evidenceId, input.commandId, input.eventId, input.correlationId, input.aggregateId, input.reasonCode]) if (!value.trim()) throw new Error("Recovery evidence identity is required.");
  if (!Number.isInteger(input.expectedVersion) || input.expectedVersion < 0) throw new Error("Recovery expected version is invalid.");
  if (!Number.isInteger(input.resultingVersion) || input.resultingVersion < 0) throw new Error("Recovery resulting version is invalid.");
  const canonical = assertFailureRecoveryCase({
    failureClass: input.failureClass,
    reasonCode: input.reasonCode,
    terminalState: input.terminalState,
    recovery: input.recovery,
    mutationCommitted: input.mutationCommitted,
    retrySafe: input.retrySafe,
    compensationAllowed: input.compensationAllowed,
    syntheticOnly: true,
  });
  void canonical;
  if (!input.mutationCommitted && input.resultingVersion !== input.expectedVersion) throw new Error("Rejected recovery evidence cannot advance the aggregate version.");
  if (input.mutationCommitted && input.resultingVersion !== input.expectedVersion + 1) throw new Error("Committed recovery evidence must advance exactly one version.");
  return Object.freeze({ ...input, syntheticOnly: true });
}

export function assertRecoveryEvidence(input: RecoveryEvidence): void {
  createRecoveryEvidence(input);
}

export function assertRecoveryEventBinding(input: RecoveryEvidence, commandId: string, eventId: string, correlationId: string, aggregateId: string): void {
  if (input.commandId !== commandId || input.eventId !== eventId || input.correlationId !== correlationId || input.aggregateId !== aggregateId) throw new Error("Recovery evidence binding mismatch.");
}
