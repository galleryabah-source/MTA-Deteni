import { createFailureRecoveryCase, type FailureClass } from "./failure-recovery-contract.js";
import { createRecoveryEvidence, assertRecoveryEventBinding, type RecoveryEvidence } from "./recovery-evidence.js";
import { createRecoveryRetryKey, decideIdempotentRetry, type RecoveryRetryRecord } from "./recovery-retry.js";
import { reconcileOfflineCommand, type OfflineCommand } from "./offline-continuity.js";

export type RecoveryJourneyOutcome = "REJECTED" | "REVIEW_REQUIRED" | "RECOVERED" | "RECONNECT_REVIEW";

export type RecoveryJourneyResult = Readonly<{
  journeyId: string;
  outcome: RecoveryJourneyOutcome;
  mutationCount: number;
  auditCount: number;
  outboxCount: number;
  retryRecords: readonly RecoveryRetryRecord[];
  evidence: readonly RecoveryEvidence[];
  syntheticOnly: true;
}>;

function assertIdentity(...values: readonly string[]): void {
  if (values.some((value) => !value.trim())) throw new Error("Recovery journey identity is required.");
}

export function executeSyntheticRecoveryJourney(input: {
  journeyId: string;
  commandId: string;
  requestHash: string;
  eventId: string;
  correlationId: string;
  aggregateId: string;
  expectedVersion: number;
  failureClass: FailureClass;
  payloadHash: string;
  reconnectCommand?: OfflineCommand;
}): RecoveryJourneyResult {
  assertIdentity(input.journeyId, input.commandId, input.requestHash, input.eventId, input.correlationId, input.aggregateId, input.payloadHash);
  if (input.requestHash === input.commandId) throw new Error("Recovery requestHash must remain distinct from commandId.");
  if (!Number.isInteger(input.expectedVersion) || input.expectedVersion < 0) throw new Error("Recovery journey expected version is invalid.");

  const failure = createFailureRecoveryCase(input.failureClass);
  const resultingVersion = failure.mutationCommitted ? input.expectedVersion + 1 : input.expectedVersion;
  const evidence = createRecoveryEvidence({
    evidenceId: `REC-${input.commandId}`,
    commandId: input.commandId,
    requestHash: input.requestHash,
    eventId: input.eventId,
    correlationId: input.correlationId,
    aggregateId: input.aggregateId,
    expectedVersion: input.expectedVersion,
    resultingVersion,
    failureClass: failure.failureClass,
    reasonCode: failure.reasonCode,
    terminalState: failure.terminalState,
    recovery: failure.recovery,
    mutationCommitted: failure.mutationCommitted,
    retrySafe: failure.retrySafe,
    compensationAllowed: failure.compensationAllowed,
  });
  assertRecoveryEventBinding(evidence, input.commandId, input.eventId, input.correlationId, input.aggregateId, input.requestHash);

  const retries: RecoveryRetryRecord[] = [];
  let outcome: RecoveryJourneyOutcome;
  if (!failure.mutationCommitted) {
    outcome = failure.recovery === "NON_RETRYABLE" ? "REJECTED" : "REVIEW_REQUIRED";
  } else {
    const retryKey = createRecoveryRetryKey(input.commandId, input.payloadHash);
    const first = decideIdempotentRetry({ retryKey, targetId: input.eventId, sourceFingerprint: input.payloadHash, prior: retries });
    retries.push(first);
    const second = decideIdempotentRetry({ retryKey, targetId: first.targetId, sourceFingerprint: first.sourceFingerprint, prior: retries });
    retries.push(second);
    if (second.decision !== "SKIP_DUPLICATE") throw new Error("Committed recovery retry did not deduplicate.");
    outcome = "RECOVERED";
  }

  if (input.reconnectCommand) {
    const decision = reconcileOfflineCommand({ command: input.reconnectCommand, existingIdempotencyKeys: [], aggregateRevisionMatches: false });
    if (decision.action !== "REVIEW_CONFLICT") throw new Error("Synthetic reconnect conflict was not bound to review.");
    outcome = "RECONNECT_REVIEW";
  }

  return Object.freeze({
    journeyId: input.journeyId,
    outcome,
    mutationCount: failure.mutationCommitted ? 1 : 0,
    auditCount: failure.mutationCommitted ? 1 : 0,
    outboxCount: failure.mutationCommitted ? 1 : 0,
    retryRecords: Object.freeze([...retries]),
    evidence: Object.freeze([evidence]),
    syntheticOnly: true,
  });
}
