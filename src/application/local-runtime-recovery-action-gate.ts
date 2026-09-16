import type { LocalRuntimeSafetyCertificationEnvelope } from "./local-runtime-safety-certification.js";
import { assertLocalRuntimeSafetyEnvelope } from "./local-runtime-safety-certification.js";

export type LocalRuntimeRecoveryAction = "RETRY_AFTER_CORRECTION" | "RETRY_AFTER_REAUTHENTICATION" | "RETRY_AFTER_SCOPE_REOPEN" | "OPERATOR_REVIEW" | "RECONCILE_BEFORE_RETRY";

export type LocalRuntimeRecoveryActionDecision = Readonly<{
  action: LocalRuntimeRecoveryAction;
  admitted: boolean;
  requiresOperatorReview: boolean;
  syntheticOnly: true;
}>;

export function resolveLocalRuntimeRecoveryAction(envelope: LocalRuntimeSafetyCertificationEnvelope): LocalRuntimeRecoveryActionDecision {
  assertLocalRuntimeSafetyEnvelope(envelope);
  if (envelope.scenario === "IDEMPOTENCY_CONFLICT") return Object.freeze({ action: "OPERATOR_REVIEW", admitted: false, requiresOperatorReview: true, syntheticOnly: true });
  if (envelope.scenario === "RECONCILIATION_REQUIRED") return Object.freeze({ action: "RECONCILE_BEFORE_RETRY", admitted: false, requiresOperatorReview: false, syntheticOnly: true });
  if (envelope.scenario === "MALFORMED_REQUEST") return Object.freeze({ action: "RETRY_AFTER_CORRECTION", admitted: envelope.safeToRetry, requiresOperatorReview: false, syntheticOnly: true });
  if (envelope.scenario === "EXPIRED_HANDSHAKE") return Object.freeze({ action: "RETRY_AFTER_REAUTHENTICATION", admitted: envelope.safeToRetry, requiresOperatorReview: false, syntheticOnly: true });
  return Object.freeze({ action: "RETRY_AFTER_SCOPE_REOPEN", admitted: envelope.safeToRetry, requiresOperatorReview: false, syntheticOnly: true });
}

export function assertLocalRuntimeRecoveryActionDecision(decision: LocalRuntimeRecoveryActionDecision): void {
  if (!decision.syntheticOnly) throw new Error("Local runtime recovery action must be synthetic-only.");
  if (decision.requiresOperatorReview && decision.admitted) throw new Error("Operator-review recovery cannot be admitted automatically.");
  if ((decision.action === "OPERATOR_REVIEW" || decision.action === "RECONCILE_BEFORE_RETRY") && decision.admitted) throw new Error("Blocked recovery action cannot be admitted.");
}
