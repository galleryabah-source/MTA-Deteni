import type { ActorContext } from "../domain/shared/contracts.js";
import type { AuthorizationPort } from "./ports.js";
import { isPermissionDeclared } from "./p12-201-240-authorization-policy-matrix.js";

export type PolicyAuthorizationAudit = Readonly<{
  actorId: string;
  domain: ActorContext["domain"];
  permission: string;
  resource?: string;
  allowed: boolean;
  reason: "POLICY_MATCH" | "POLICY_DENY" | "INVALID_ACTOR_CONTEXT";
}>;

export type AuthorizationDecisionSink = Readonly<{
  record(decision: PolicyAuthorizationAudit): Promise<void>;
}>;

export class PolicyEnforcingAuthorization implements AuthorizationPort {
  constructor(private readonly sink?: AuthorizationDecisionSink) {}

  async authorize(actor: ActorContext, permission: string, resource?: string): Promise<boolean> {
    const validActor = actor.actorId.trim().length > 0 && actor.correlationId.trim().length > 0;
    const allowed = validActor && isPermissionDeclared(actor.domain, permission);
    await this.sink?.record({
      actorId: actor.actorId,
      domain: actor.domain,
      permission,
      ...(resource === undefined ? {} : { resource }),
      allowed,
      reason: !validActor ? "INVALID_ACTOR_CONTEXT" : allowed ? "POLICY_MATCH" : "POLICY_DENY",
    });
    return allowed;
  }
}

export function assertAuthorizationBoundary(actor: ActorContext, permission: string): void {
  if (!actor.actorId.trim() || !actor.correlationId.trim()) throw new Error("ACTOR_CONTEXT_REQUIRED");
  if (!isPermissionDeclared(actor.domain, permission)) throw new Error("FORBIDDEN_BY_DOMAIN_POLICY");
}
