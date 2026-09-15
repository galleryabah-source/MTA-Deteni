import type { ActorContext, DomainName } from "../domain/shared/contracts.js";

export type AuthorizationCase = Readonly<{
  checkpoint: string;
  actor: ActorContext;
  requiredDomain: DomainName;
  permission: string;
  allowed: boolean;
}>;

const nonBlank = (value: string) => value.trim().length > 0;

export function evaluateAuthorizationCase(value: AuthorizationCase): "PASS" | "BLOCKED" {
  if (!nonBlank(value.checkpoint) || !nonBlank(value.permission) || !nonBlank(value.actor.actorId) || !nonBlank(value.actor.correlationId)) return "BLOCKED";
  const expected = value.actor.domain === value.requiredDomain;
  return expected === value.allowed ? "PASS" : "BLOCKED";
}

export function denyByDefault(actor: ActorContext, requiredDomain: DomainName): boolean {
  return nonBlank(actor.actorId) && actor.domain === requiredDomain;
}
