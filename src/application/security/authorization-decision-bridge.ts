export const AUTHORIZATION_DECISION_BRIDGE_VERSION = "P10.20-v1";

export type AuthorizationReason =
  | "AUTH_REQUIRED" | "PERMISSION_DENIED" | "SCOPE_DENIED"
  | "DUTY_REQUIRED" | "DUTY_INACTIVE" | "RESOURCE_CLASSIFICATION_DENIED"
  | "INVALID_STATE" | "POLICY_DENIED" | "SEGREGATION_OF_DUTIES";

export interface AuthorizationContext {
  authenticated: boolean;
  role: string;
  permission: string;
  scopeAllowed: boolean;
  dutyActive: boolean;
  resourceAllowed: boolean;
  currentStateAllowed: boolean;
  policyAllowed: boolean;
}

export interface AuthorizationDecision {
  allowed: boolean;
  reasonCode?: AuthorizationReason;
  policyVersion: string;
}

export function authorize(context: AuthorizationContext): AuthorizationDecision {
  if (!context.authenticated) return { allowed:false, reasonCode:"AUTH_REQUIRED", policyVersion:AUTHORIZATION_DECISION_BRIDGE_VERSION };
  if (!context.role || !context.permission) return { allowed:false, reasonCode:"PERMISSION_DENIED", policyVersion:AUTHORIZATION_DECISION_BRIDGE_VERSION };
  if (!context.scopeAllowed) return { allowed:false, reasonCode:"SCOPE_DENIED", policyVersion:AUTHORIZATION_DECISION_BRIDGE_VERSION };
  if (!context.dutyActive) return { allowed:false, reasonCode:"DUTY_INACTIVE", policyVersion:AUTHORIZATION_DECISION_BRIDGE_VERSION };
  if (!context.resourceAllowed) return { allowed:false, reasonCode:"RESOURCE_CLASSIFICATION_DENIED", policyVersion:AUTHORIZATION_DECISION_BRIDGE_VERSION };
  if (!context.currentStateAllowed) return { allowed:false, reasonCode:"INVALID_STATE", policyVersion:AUTHORIZATION_DECISION_BRIDGE_VERSION };
  if (!context.policyAllowed) return { allowed:false, reasonCode:"POLICY_DENIED", policyVersion:AUTHORIZATION_DECISION_BRIDGE_VERSION };
  return { allowed:true, policyVersion:AUTHORIZATION_DECISION_BRIDGE_VERSION };
}
