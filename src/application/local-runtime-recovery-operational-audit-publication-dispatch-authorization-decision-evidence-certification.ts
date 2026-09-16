import type { LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidence } from "./local-runtime-recovery-operational-audit-publication-dispatch-authorization-decision-evidence.js";
import type { LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionCertification } from "./local-runtime-recovery-operational-audit-publication-dispatch-authorization-decision-certification.js";
import { createLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidence, assertLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidence } from "./local-runtime-recovery-operational-audit-publication-dispatch-authorization-decision-evidence.js";
import { replayLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidence, type OperationalAuditPublicationDispatchAuthorizationDecisionEvidenceReplayDisposition } from "./local-runtime-recovery-operational-audit-publication-dispatch-authorization-decision-evidence-replay.js";

export type LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceCertification = Readonly<LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidence & { certificationId: string; replayDisposition: OperationalAuditPublicationDispatchAuthorizationDecisionEvidenceReplayDisposition; certified: true }>;

export function certifyLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidence(input: { certificationId: string; evidence?: LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidence; evidenceId?: string; decisionCertification: LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionCertification }): LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceCertification {
  if (!input.certificationId.trim()) throw new Error("Authorization decision evidence certification identity is required.");
  const evidence = input.evidence ?? createLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidence({ evidenceId: input.evidenceId ?? "", decisionCertification: input.decisionCertification });
  assertLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidence(evidence, input.decisionCertification);
  const replayDisposition = replayLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidence({ evidence, certification: input.decisionCertification });
  if (replayDisposition === "CONFLICT") throw new Error("Authorization decision evidence certification replay conflict.");
  return Object.freeze({ ...evidence, certificationId: input.certificationId, replayDisposition, certified: true });
}
