import type { LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecision } from "./local-runtime-recovery-operational-audit-publication-dispatch-authorization-decision.js";
import type { LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationCertification } from "./local-runtime-recovery-operational-audit-publication-dispatch-authorization-certification.js";
import { createLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecision, assertLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecision } from "./local-runtime-recovery-operational-audit-publication-dispatch-authorization-decision.js";
import { replayLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecision, type OperationalAuditPublicationDispatchAuthorizationDecisionReplayDisposition } from "./local-runtime-recovery-operational-audit-publication-dispatch-authorization-decision-replay.js";

export type LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionCertification = Readonly<LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecision & { certificationId: string; replayDisposition: OperationalAuditPublicationDispatchAuthorizationDecisionReplayDisposition; certified: true }>;

export function certifyLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecision(input: { certificationId: string; decision?: LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecision; decisionId?: string; authorizationCertification: LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationCertification }): LocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionCertification {
  if (!input.certificationId.trim()) throw new Error("Authorization decision certification identity is required.");
  const decision = input.decision ?? createLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecision({ decisionId: input.decisionId ?? "", authorizationCertification: input.authorizationCertification });
  assertLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecision(decision, input.authorizationCertification);
  const replayDisposition = replayLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecision({ decision, certification: input.authorizationCertification });
  if (replayDisposition === "CONFLICT") throw new Error("Authorization decision certification replay conflict.");
  return Object.freeze({ ...decision, certificationId: input.certificationId, replayDisposition, certified: true });
}
