import { classificationAllowsExternalAi } from "./classification";
import type { DataGovernancePolicy, DataClassification } from "./types";

export interface GovernanceAccessRequest {
  readonly classification: DataClassification;
  readonly purpose?: string;
  readonly requestedExternalAi?: boolean;
}

export interface GovernanceDecision {
  readonly allowed: boolean;
  readonly reason:
    | "ALLOWED"
    | "PURPOSE_REQUIRED"
    | "PURPOSE_NOT_ALLOWED"
    | "CLASSIFICATION_BLOCKED"
    | "EXTERNAL_AI_BLOCKED";
}

export const authorizeDataUse = (
  policy: DataGovernancePolicy,
  request: GovernanceAccessRequest,
): GovernanceDecision => {
  if (policy.classification !== request.classification) {
    return { allowed: false, reason: "CLASSIFICATION_BLOCKED" };
  }

  if (policy.allowedPurposes.length > 0 && !request.purpose) {
    return { allowed: false, reason: "PURPOSE_REQUIRED" };
  }

  if (request.purpose && !policy.allowedPurposes.includes(request.purpose)) {
    return { allowed: false, reason: "PURPOSE_NOT_ALLOWED" };
  }

  if (request.requestedExternalAi) {
    if (!policy.externalAiAllowed || !classificationAllowsExternalAi(policy.classification)) {
      return { allowed: false, reason: "EXTERNAL_AI_BLOCKED" };
    }
  }

  return { allowed: true, reason: "ALLOWED" };
};
