export const PRODUCTION_READ_BOUNDARY_VERSION = "P9.23-v1";

export interface ReadContext {
  authenticated: boolean;
  role: string;
  scopeAllowed: boolean;
  classificationAllowed: boolean;
}

export type ReadDecision = "ALLOW" | "AUTH_REQUIRED" | "SCOPE_DENIED" | "CLASSIFICATION_DENIED" | "ROLE_DENIED";

export function authorizeProductionRead(context: ReadContext): ReadDecision {
  if (!context.authenticated) return "AUTH_REQUIRED";
  if (!context.scopeAllowed) return "SCOPE_DENIED";
  if (!context.classificationAllowed) return "CLASSIFICATION_DENIED";
  if (!context.role) return "ROLE_DENIED";
  return "ALLOW";
}
