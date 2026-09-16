import type { LocalRuntimeFailureClass } from "./local-runtime-failure-evidence.js";

export type LocalRuntimeFailureScenario =
  | "MALFORMED_REQUEST"
  | "EXPIRED_HANDSHAKE"
  | "SESSION_SCOPE_DRIFT"
  | "IDEMPOTENCY_CONFLICT"
  | "RECONCILIATION_REQUIRED";

export type LocalRuntimeRecoveryDisposition =
  | "REJECT_AND_CORRECT_REQUEST"
  | "REAUTHENTICATE_HANDSHAKE"
  | "REOPEN_VALID_SESSION_SCOPE"
  | "REVIEW_IDEMPOTENCY_CONFLICT"
  | "RECONCILE_BEFORE_RETRY";

export type LocalRuntimeFailureMatrixCase = Readonly<{
  scenario: LocalRuntimeFailureScenario;
  failureClass: LocalRuntimeFailureClass;
  responseStatus: "REJECTED";
  disposition: LocalRuntimeRecoveryDisposition;
  retryAllowed: boolean;
  requiresOperatorReview: boolean;
  syntheticOnly: true;
}>;

const CASES: readonly LocalRuntimeFailureMatrixCase[] = Object.freeze([
  Object.freeze({ scenario: "MALFORMED_REQUEST", failureClass: "REQUEST_REJECTED", responseStatus: "REJECTED", disposition: "REJECT_AND_CORRECT_REQUEST", retryAllowed: true, requiresOperatorReview: false, syntheticOnly: true }),
  Object.freeze({ scenario: "EXPIRED_HANDSHAKE", failureClass: "HANDSHAKE_REJECTED", responseStatus: "REJECTED", disposition: "REAUTHENTICATE_HANDSHAKE", retryAllowed: true, requiresOperatorReview: false, syntheticOnly: true }),
  Object.freeze({ scenario: "SESSION_SCOPE_DRIFT", failureClass: "SESSION_SCOPE_REJECTED", responseStatus: "REJECTED", disposition: "REOPEN_VALID_SESSION_SCOPE", retryAllowed: true, requiresOperatorReview: false, syntheticOnly: true }),
  Object.freeze({ scenario: "IDEMPOTENCY_CONFLICT", failureClass: "EXECUTION_REJECTED", responseStatus: "REJECTED", disposition: "REVIEW_IDEMPOTENCY_CONFLICT", retryAllowed: false, requiresOperatorReview: true, syntheticOnly: true }),
  Object.freeze({ scenario: "RECONCILIATION_REQUIRED", failureClass: "EXECUTION_REJECTED", responseStatus: "REJECTED", disposition: "RECONCILE_BEFORE_RETRY", retryAllowed: false, requiresOperatorReview: false, syntheticOnly: true })
]);

export function getLocalRuntimeFailureMatrix(): readonly LocalRuntimeFailureMatrixCase[] {
  return CASES;
}

export function resolveLocalRuntimeRecoveryDisposition(input: { scenario: LocalRuntimeFailureScenario; failureClass: LocalRuntimeFailureClass }): LocalRuntimeFailureMatrixCase {
  const match = CASES.find((entry) => entry.scenario === input.scenario);
  if (!match) throw new Error("Unknown local runtime failure scenario.");
  if (match.failureClass !== input.failureClass) throw new Error("Local runtime failure scenario/class mismatch.");
  return match;
}

export function assertLocalRuntimeFailureMatrixCase(entry: LocalRuntimeFailureMatrixCase): void {
  const expected = resolveLocalRuntimeRecoveryDisposition({ scenario: entry.scenario, failureClass: entry.failureClass });
  if (entry.responseStatus !== "REJECTED" || !entry.syntheticOnly) throw new Error("Local runtime failure matrix must be rejected and synthetic-only.");
  if (entry.disposition !== expected.disposition || entry.retryAllowed !== expected.retryAllowed || entry.requiresOperatorReview !== expected.requiresOperatorReview) throw new Error("Local runtime failure recovery disposition drift.");
}
