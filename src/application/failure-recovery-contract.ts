export type FailureClass =
  | "AUTHORIZATION_DENIED"
  | "STALE_VERSION"
  | "IDEMPOTENCY_CONFLICT"
  | "REPOSITORY_CONFLICT"
  | "OUTBOX_FAILURE"
  | "PROJECTION_REFRESH_FAILURE"
  | "OFFLINE_RECONNECT_CONFLICT";

export type RecoveryClassification = "RETRYABLE" | "REVIEW_REQUIRED" | "NON_RETRYABLE" | "COMPENSATION_REQUIRED";

export type FailureTerminalState = "REJECTED" | "BLOCKED" | "REVIEW_PENDING" | "RETRY_PENDING" | "COMPENSATION_PENDING";

export type FailureRecoveryCase = Readonly<{
  failureClass: FailureClass;
  reasonCode: string;
  terminalState: FailureTerminalState;
  recovery: RecoveryClassification;
  mutationCommitted: boolean;
  retrySafe: boolean;
  compensationAllowed: boolean;
  syntheticOnly: true;
}>;

const MATRIX: Readonly<Record<FailureClass, Omit<FailureRecoveryCase, "failureClass">>> = Object.freeze({
  AUTHORIZATION_DENIED: { reasonCode: "AUTHZ_DENIED", terminalState: "REJECTED", recovery: "NON_RETRYABLE", mutationCommitted: false, retrySafe: false, compensationAllowed: false, syntheticOnly: true },
  STALE_VERSION: { reasonCode: "VERSION_STALE", terminalState: "REVIEW_PENDING", recovery: "REVIEW_REQUIRED", mutationCommitted: false, retrySafe: false, compensationAllowed: false, syntheticOnly: true },
  IDEMPOTENCY_CONFLICT: { reasonCode: "IDEMPOTENCY_REUSE", terminalState: "REJECTED", recovery: "NON_RETRYABLE", mutationCommitted: false, retrySafe: false, compensationAllowed: false, syntheticOnly: true },
  REPOSITORY_CONFLICT: { reasonCode: "REPOSITORY_VERSION_CONFLICT", terminalState: "REVIEW_PENDING", recovery: "REVIEW_REQUIRED", mutationCommitted: false, retrySafe: false, compensationAllowed: false, syntheticOnly: true },
  OUTBOX_FAILURE: { reasonCode: "OUTBOX_PUBLISH_FAILURE", terminalState: "RETRY_PENDING", recovery: "RETRYABLE", mutationCommitted: true, retrySafe: true, compensationAllowed: false, syntheticOnly: true },
  PROJECTION_REFRESH_FAILURE: { reasonCode: "PROJECTION_REFRESH_FAILED", terminalState: "RETRY_PENDING", recovery: "RETRYABLE", mutationCommitted: true, retrySafe: true, compensationAllowed: false, syntheticOnly: true },
  OFFLINE_RECONNECT_CONFLICT: { reasonCode: "OFFLINE_RECONNECT_CONFLICT", terminalState: "REVIEW_PENDING", recovery: "REVIEW_REQUIRED", mutationCommitted: false, retrySafe: false, compensationAllowed: false, syntheticOnly: true },
});

export function createFailureRecoveryCase(failureClass: FailureClass): FailureRecoveryCase {
  return Object.freeze({ failureClass, ...MATRIX[failureClass] });
}

export function assertFailureRecoveryCase(input: FailureRecoveryCase): void {
  const expected = createFailureRecoveryCase(input.failureClass);
  if (JSON.stringify(input) !== JSON.stringify(expected)) throw new Error("Failure recovery case is not canonical.");
  if (!input.syntheticOnly) throw new Error("Failure recovery contract accepts synthetic cases only.");
  if (input.mutationCommitted && input.terminalState === "REJECTED") throw new Error("A committed mutation cannot be represented as a simple rejection.");
  if (!input.retrySafe && input.recovery === "RETRYABLE") throw new Error("Retryable failure must explicitly be retry-safe.");
  if (input.compensationAllowed && input.terminalState !== "COMPENSATION_PENDING") throw new Error("Compensation requires an explicit compensation boundary.");
}

export function assertCompensationBoundary(input: FailureRecoveryCase): void {
  if (input.compensationAllowed && input.mutationCommitted !== true) throw new Error("Compensation requires a committed effect.");
  if (input.compensationAllowed && input.recovery !== "COMPENSATION_REQUIRED") throw new Error("Compensation classification is required.");
}

export function failureRecoveryFingerprint(input: FailureRecoveryCase): string {
  assertFailureRecoveryCase(input);
  return JSON.stringify({ failureClass: input.failureClass, reasonCode: input.reasonCode, terminalState: input.terminalState, recovery: input.recovery, mutationCommitted: input.mutationCommitted, retrySafe: input.retrySafe, compensationAllowed: input.compensationAllowed });
}
