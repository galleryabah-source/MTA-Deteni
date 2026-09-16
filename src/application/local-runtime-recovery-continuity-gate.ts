import type { LocalRuntimeSafetyCertificationEnvelope } from "./local-runtime-safety-certification.js";
import { assertLocalRuntimeSafetyEnvelope } from "./local-runtime-safety-certification.js";
import { assertLocalRuntimeRecoveryActionDecision, resolveLocalRuntimeRecoveryAction, type LocalRuntimeRecoveryActionDecision } from "./local-runtime-recovery-action-gate.js";

export type LocalRuntimeRecoveryContinuityState = "READY_FOR_CORRECTION_RETRY" | "READY_FOR_REAUTHENTICATION_RETRY" | "READY_FOR_SCOPE_REOPEN_RETRY" | "OPERATOR_REVIEW_REQUIRED" | "RECONCILIATION_REQUIRED";

export type LocalRuntimeRecoveryContinuityDecision = Readonly<{
  state: LocalRuntimeRecoveryContinuityState;
  action: LocalRuntimeRecoveryActionDecision["action"];
  admitted: boolean;
  syntheticOnly: true;
}>;

export function assessLocalRuntimeRecoveryContinuity(envelope: LocalRuntimeSafetyCertificationEnvelope): LocalRuntimeRecoveryContinuityDecision {
  assertLocalRuntimeSafetyEnvelope(envelope);
  const action = resolveLocalRuntimeRecoveryAction(envelope);
  assertLocalRuntimeRecoveryActionDecision(action);
  const state: LocalRuntimeRecoveryContinuityState = action.action === "OPERATOR_REVIEW"
    ? "OPERATOR_REVIEW_REQUIRED"
    : action.action === "RECONCILE_BEFORE_RETRY"
      ? "RECONCILIATION_REQUIRED"
      : action.action === "RETRY_AFTER_CORRECTION"
        ? "READY_FOR_CORRECTION_RETRY"
        : action.action === "RETRY_AFTER_REAUTHENTICATION"
          ? "READY_FOR_REAUTHENTICATION_RETRY"
          : "READY_FOR_SCOPE_REOPEN_RETRY";
  return Object.freeze({ state, action: action.action, admitted: action.admitted, syntheticOnly: true });
}

export function assertLocalRuntimeRecoveryContinuityDecision(decision: LocalRuntimeRecoveryContinuityDecision): void {
  if (!decision.syntheticOnly) throw new Error("Local runtime recovery continuity decision must be synthetic-only.");
  if ((decision.state === "OPERATOR_REVIEW_REQUIRED" || decision.state === "RECONCILIATION_REQUIRED") && decision.admitted) throw new Error("Recovery continuity gate cannot admit blocked recovery state.");
}
