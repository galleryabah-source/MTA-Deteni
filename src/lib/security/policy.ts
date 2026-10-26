import type { AuthorizationRequest, AuthorizationDecision } from "./types";

export type PolicyGuardrail =
  | "SELF_PRIVILEGE_ESCALATION"
  | "SEPARATION_OF_DUTIES"
  | "CRITICAL_SECOND_APPROVAL"
  | "SENSITIVE_EXPORT"
  | "BREAK_GLASS";

export interface PolicyEvaluation {
  allowed: boolean;
  guardrails: readonly PolicyGuardrail[];
  reason?: AuthorizationDecision["reason"];
}

export function evaluatePolicyGuardrails(
  request: AuthorizationRequest,
  decision: AuthorizationDecision,
): PolicyEvaluation {
  if (!decision.allowed) {
    return { allowed: false, guardrails: ["SEPARATION_OF_DUTIES"], reason: decision.reason };
  }

  const guardrails: PolicyGuardrail[] = [];
  const isRbacChange = request.resource.domain === "RBAC";
  const isSelfTarget = request.resource.resourceId === request.subject.userId;

  if (isRbacChange && isSelfTarget) {
    return { allowed: false, guardrails: ["SELF_PRIVILEGE_ESCALATION"], reason: "POLICY_BLOCKED" };
  }

  if (request.action === "EXPORT" || request.action === "DOWNLOAD") {
    guardrails.push("SENSITIVE_EXPORT");
  }

  if (request.context.isBreakGlass) {
    guardrails.push("BREAK_GLASS");
  }

  if (request.action === "APPROVE" && request.context.secondApproverUserId) {
    guardrails.push("CRITICAL_SECOND_APPROVAL");
  }

  return { allowed: true, guardrails };
}
