import type { LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosure } from "./local-runtime-recovery-operational-audit-publication-dispatch-authorization-decision-evidence-closure.js";
import type { LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionCertification } from "./local-runtime-recovery-operational-audit-publication-dispatch-authorization-decision-certification.js";
import { createLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosure, assertLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosure } from "./local-runtime-recovery-operational-audit-publication-dispatch-authorization-decision-evidence-closure.js";
import { replayLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosure, type OperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureReplayDisposition } from "./local-runtime-recovery-operational-audit-publication-dispatch-authorization-decision-evidence-closure-replay.js";

export type LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureCertification = Readonly<LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosure & { certificationId: string; replayDisposition: OperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureReplayDisposition; certified: true }>;

export function certifyLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosure(input: { certificationId: string; closure?: LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosure; closureId?: string; evidence: LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosure; decisionCertification: LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionCertification }): LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureCertification {
  if (!input.certificationId.trim()) throw new Error("Authorization decision evidence closure certification identity is required.");
  const closure = input.closure ?? input.evidence;
  if (input.closure && input.evidence.closureId !== input.closure.closureId) throw new Error("Authorization decision evidence closure identity drift.");
  assertLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosure(closure, input.decisionCertification);
  const replayDisposition = replayLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosure({ closure, decisionCertification: input.decisionCertification });
  if (replayDisposition === "CONFLICT") throw new Error("Authorization decision evidence closure certification replay conflict.");
  return Object.freeze({ ...closure, certificationId: input.certificationId, replayDisposition, certified: true });
}
