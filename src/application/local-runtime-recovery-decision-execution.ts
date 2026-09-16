import type { LocalRuntimeRecoveryDecision } from "./local-runtime-recovery-decision-integrity.js";
import { assertLocalRuntimeRecoveryDecisionIntegrity } from "./local-runtime-recovery-decision-integrity.js";
import type { LocalRuntimeRecoveryDecisionCertification } from "./local-runtime-recovery-decision-certification.js";
import { assertLocalRuntimeRecoveryDecisionCertification } from "./local-runtime-recovery-decision-certification.js";
import type { LocalRuntimeRecoveryDecisionReplayResult } from "./local-runtime-recovery-decision-replay-guard.js";
import { assertLocalRuntimeRecoveryDecisionReplayResult } from "./local-runtime-recovery-decision-replay-guard.js";
import type { LocalRuntimeRecoveryDecisionAuditEvidence } from "./local-runtime-recovery-decision-audit.js";
import { assertLocalRuntimeRecoveryDecisionAuditEvidence } from "./local-runtime-recovery-decision-audit.js";
import type { LocalRuntimeSafetyCertificationEnvelope } from "./local-runtime-safety-certification.js";
import type { LocalRuntimeRequest } from "./local-runtime-adapter.js";
import { assertLocalRuntimeRequest } from "./local-runtime-adapter.js";

export type LocalRuntimeRecoveryDecisionExecution = Readonly<{
  executionId: string;
  decisionId: string;
  requestId: string;
  certificationId: string;
  auditEvidenceId: string;
  envelopeId: string;
  admitted: true;
  syntheticOnly: true;
}>;

export function admitLocalRuntimeRecoveryDecisionExecution(input: { executionId: string; request: LocalRuntimeRequest; decision: LocalRuntimeRecoveryDecision; certification: LocalRuntimeRecoveryDecisionCertification; replay: LocalRuntimeRecoveryDecisionReplayResult; auditEvidence: LocalRuntimeRecoveryDecisionAuditEvidence; envelope: LocalRuntimeSafetyCertificationEnvelope }): LocalRuntimeRecoveryDecisionExecution {
  if (!input.executionId.trim()) throw new Error("Recovery decision execution identity is required.");
  assertLocalRuntimeRequest(input.request);
  assertLocalRuntimeRecoveryDecisionIntegrity(input.decision, input.envelope);
  assertLocalRuntimeRecoveryDecisionReplayResult(input.replay);
  assertLocalRuntimeRecoveryDecisionAuditEvidence(input.auditEvidence, input.decision);
  assertLocalRuntimeRecoveryDecisionCertification(input.certification, input.decision, input.auditEvidence, input.envelope);
  if (input.replay.disposition !== "ADMIT" || !input.replay.admitted || !input.decision.admitted || !input.certification.admitted) throw new Error("Recovery decision execution requires an admitted decision.");
  if (input.certification.decisionId !== input.decision.decisionId || input.auditEvidence.auditEvidenceId !== input.certification.auditEvidenceId) throw new Error("Recovery decision execution certification drift.");
  return Object.freeze({ executionId: input.executionId, decisionId: input.decision.decisionId, requestId: input.request.requestId, certificationId: input.certification.certificationId, auditEvidenceId: input.auditEvidence.auditEvidenceId, envelopeId: input.envelope.envelopeId, admitted: true, syntheticOnly: true });
}

export function assertLocalRuntimeRecoveryDecisionExecution(execution: LocalRuntimeRecoveryDecisionExecution): void {
  if (!execution.syntheticOnly || !execution.admitted) throw new Error("Recovery decision execution must be admitted and synthetic-only.");
  if (!execution.executionId.trim() || !execution.decisionId.trim() || !execution.requestId.trim() || !execution.certificationId.trim() || !execution.auditEvidenceId.trim() || !execution.envelopeId.trim()) throw new Error("Recovery decision execution identity is required.");
}
