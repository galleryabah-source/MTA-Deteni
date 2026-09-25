import type { ActorContext } from "../domain/shared/contracts.js";
import { isPermissionDeclared } from "./p12-201-240-authorization-policy-matrix.js";

export const AUTHZ_ADVERSARIAL_VERSION = "AUTHZ-ADVERSARIAL-v1";

export type AuthorizationAdversarialCase = Readonly<{
  name: string;
  actor: ActorContext;
  permission: string;
  expected: boolean;
}>;

export type AuthorizationAdversarialResult = Readonly<{
  version: typeof AUTHZ_ADVERSARIAL_VERSION;
  name: string;
  allowed: boolean;
  expected: boolean;
  status: "PASS" | "FAIL";
}>;

function validActor(actor: ActorContext): boolean {
  return actor.actorId.trim().length > 0 && actor.correlationId.trim().length > 0;
}

export function evaluateAuthorizationAdversarialCase(value: AuthorizationAdversarialCase): AuthorizationAdversarialResult {
  const allowed = validActor(value.actor) && isPermissionDeclared(value.actor.domain, value.permission);
  return Object.freeze({
    version: AUTHZ_ADVERSARIAL_VERSION,
    name: value.name,
    allowed,
    expected: value.expected,
    status: allowed === value.expected ? "PASS" : "FAIL",
  });
}

export function runAuthorizationAdversarialSuite(cases: readonly AuthorizationAdversarialCase[]): readonly AuthorizationAdversarialResult[] {
  return Object.freeze(cases.map(evaluateAuthorizationAdversarialCase));
}
