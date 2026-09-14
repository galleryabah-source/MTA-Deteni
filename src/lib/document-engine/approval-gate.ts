import type { DocumentKind, DocumentLifecycle } from "./types";

export type DocumentApprovalAction = "APPROVE" | "ISSUE";

export interface DocumentApprovalRequest {
  readonly documentId: string;
  readonly documentKind: DocumentKind;
  readonly currentLifecycle: DocumentLifecycle;
  readonly actorUserId: string;
  readonly action: DocumentApprovalAction;
  readonly requiredApproval: boolean;
  readonly isAuthorized: boolean;
  readonly secondApproverUserId?: string;
  readonly correlationId: string;
}

export interface DocumentApprovalDecision {
  readonly allowed: boolean;
  readonly reason:
    | "APPROVED"
    | "APPROVAL_REQUIRED"
    | "AUTHORIZATION_DENIED"
    | "INVALID_WORKFLOW_STATE"
    | "SECOND_APPROVAL_REQUIRED"
    | "SELF_APPROVAL_BLOCKED";
}

const allowedState: Record<DocumentApprovalAction, DocumentLifecycle> = {
  APPROVE: "REVIEWED",
  ISSUE: "APPROVED",
};

export const evaluateDocumentApproval = (
  request: DocumentApprovalRequest,
): DocumentApprovalDecision => {
  if (!request.documentId || !request.actorUserId || !request.correlationId) {
    return { allowed: false, reason: "INVALID_WORKFLOW_STATE" };
  }
  if (request.currentLifecycle !== allowedState[request.action]) {
    return { allowed: false, reason: "INVALID_WORKFLOW_STATE" };
  }
  if (!request.isAuthorized) return { allowed: false, reason: "AUTHORIZATION_DENIED" };
  if (!request.requiredApproval) return { allowed: true, reason: "APPROVED" };
  if (request.secondApproverUserId !== undefined && request.secondApproverUserId === request.actorUserId) {
    return { allowed: false, reason: "SELF_APPROVAL_BLOCKED" };
  }
  if (request.action === "ISSUE" && request.secondApproverUserId === undefined) {
    return { allowed: false, reason: "SECOND_APPROVAL_REQUIRED" };
  }
  return { allowed: true, reason: "APPROVED" };
};
