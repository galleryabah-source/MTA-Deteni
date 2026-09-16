import type { AuthorizationDecision, AuthorizationRequest, AuthorizationPolicy } from "../security/types";
import { AuthorizationEngine } from "../security/authorization";
import { evaluatePolicyGuardrails, type PolicyEvaluation } from "../security/policy";

export interface CoreEngineDecision {
  authorization: AuthorizationDecision;
  policy: PolicyEvaluation;
}

/**
 * Single application-level security entry point.
 * Domain modules should call this contract instead of implementing local
 * authorization/policy rules of their own.
 */
export class CoreSecurityEngine {
  private readonly authorization: AuthorizationEngine;

  constructor(private readonly policy: AuthorizationPolicy) {
    this.authorization = new AuthorizationEngine(policy);
  }

  authorize(request: AuthorizationRequest): CoreEngineDecision {
    const authorization = this.authorization.decide(request);
    const policy = evaluatePolicyGuardrails(request, authorization);
    return { authorization, policy };
  }
}
