import { DomainError } from "../domain/shared/errors.js";
import type { ActorContext } from "../domain/shared/contracts.js";
import { MTA_ROUTE_POLICIES, type HttpMethod } from "./transport-contract.js";
import { ROLE_READ_MODEL_ACCESS, type DashboardRole } from "./read-model.js";

export type RuntimeMode = "LOCAL" | "CI" | "NONPROD" | "PRODUCTION";

export type RuntimeSafetyConfig = Readonly<{
  mode: RuntimeMode;
  migrationFreeze: boolean;
  productionAccessAuthorized: boolean;
  approvedNonProductionTarget: boolean;
  aiEnabled: boolean;
  syntheticDataOnly: boolean;
}>;

export function assertSafeIntegration(config: RuntimeSafetyConfig): void {
  if (config.mode === "PRODUCTION") throw new DomainError("FORBIDDEN_SCOPE", "Production integration is blocked by the implementation gate.");
  if (!config.migrationFreeze) throw new DomainError("FORBIDDEN_SCOPE", "Migration freeze must remain enabled.");
  if (config.productionAccessAuthorized) throw new DomainError("FORBIDDEN_SCOPE", "Production access is not permitted by this integration boundary.");
  if (config.aiEnabled) throw new DomainError("FORBIDDEN_SCOPE", "AI runtime is disabled at this integration stage.");
  if (!config.syntheticDataOnly) throw new DomainError("FORBIDDEN_SCOPE", "Integration harness accepts synthetic data only.");
  if (config.mode === "NONPROD" && !config.approvedNonProductionTarget) throw new DomainError("VALIDATION_FAILED", "An approved non-production target is required.");
}

export function resolveRoute(method: HttpMethod, route: string) {
  const policy = MTA_ROUTE_POLICIES.find((candidate) => candidate.method === method && candidate.route === route);
  if (!policy) throw new DomainError("VALIDATION_FAILED", "Route is not part of the governed transport contract.");
  return policy;
}

export function assertReadPermission(actor: ActorContext, permission: string): void {
  const role = actor.role as DashboardRole;
  const permissions = ROLE_READ_MODEL_ACCESS[role];
  if (!permissions?.includes(permission)) throw new DomainError("FORBIDDEN_SCOPE", "Actor is not authorized for this read model.");
}
