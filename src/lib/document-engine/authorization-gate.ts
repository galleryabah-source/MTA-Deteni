import type {
  AuthorizationDecision,
  AuthorizationRequest,
  SecurityDomain,
} from "../security/types";
import { AuthorizationEngine } from "../security/authorization";
import { evaluatePolicyGuardrails } from "../security/policy";
import type { DocumentApprovalAction, DocumentApprovalDecision, DocumentApprovalRequest } from "./approval-gate";
import { evaluateDocumentApproval } from "./approval-gate";

export interface DocumentAuthorizationInput {
  readonly approval: DocumentApprovalRequest;
  readonly subject: AuthorizationRequest["subject"];
  readonly unit?: string;
  readonly ownerUnit?: string;
  readonly classification?: AuthorizationRequest["resource"]["classification"];
  readonly permission: string;
}

export interface DocumentAuthorizationDecision extends DocumentApprovalDecision {
  readonly authorization: AuthorizationDecision;
  readonly guardrails: readonly string[];
}

const toSecurityAction = (action: DocumentApprovalAction): AuthorizationRequest["action"] =>
  action === "APPROVE" ? "APPROVE" : "ISSUE";

const toSecurityDomain = (
  kind: DocumentApprovalRequest["documentKind"],
): SecurityDomain =>
  kind === "SURAT_IZIN_KELUAR_SEMENTARA" ? "TEMPORARY_EXIT" : "ESCORT";

export const buildDocumentAuthorizationRequest = (
  input: DocumentAuthorizationInput,
): AuthorizationRequest => ({
  subject: input.subject,
  permission: input.permission,
  action: toSecurityAction(input.approval.action),
  resource: {
    domain: toSecurityDomain(input.approval.documentKind),
    resourceId: input.approval.documentId,
    ownerUnit: input.ownerUnit,
    workflowState: input.approval.currentLifecycle,
    classification: input.classification,
  },
  context: {
    unit: input.unit,
    workflowState: input.approval.currentLifecycle,
    secondApproverUserId: input.approval.secondApproverUserId,
    correlationId: input.approval.correlationId,
  },
});

export const evaluateDocumentAuthorization = (
  input: DocumentAuthorizationInput,
  engine: AuthorizationEngine,
): DocumentAuthorizationDecision => {
  const authorizationRequest = buildDocumentAuthorizationRequest(input);
  const authorization = engine.decide(authorizationRequest);

  if (authorization.correlationId !== input.approval.correlationId) {
    return {
      allowed: false,
      reason: "AUTHORIZATION_DENIED",
      authorization,
      guardrails: ["CORRELATION_ID_MISMATCH"],
    };
  }

  const guardrails = evaluatePolicyGuardrails(authorizationRequest, authorization);
  if (!guardrails.allowed) {
    return {
      allowed: false,
      reason: "AUTHORIZATION_DENIED",
      authorization,
      guardrails: guardrails.guardrails,
    };
  }

  const approval = evaluateDocumentApproval({
    ...input.approval,
    // This value is derived server-side from AuthorizationEngine; it is not client proof.
    isAuthorized: authorization.allowed,
  });

  return {
    ...approval,
    authorization,
    guardrails: guardrails.guardrails,
  };
};
