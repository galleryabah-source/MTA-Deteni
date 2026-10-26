import type { AuthorizationSubject, SecurityDomain, SecurityAction } from "./types";

export interface RestrictedAccessRequest {
  subject: AuthorizationSubject;
  domain: SecurityDomain;
  action: SecurityAction;
  purpose?: string;
  minimumNecessary: boolean;
}

export interface RestrictedAccessDecision {
  allowed: boolean;
  reason: "ALLOWED" | "ROLE_REQUIRED" | "PURPOSE_REQUIRED" | "MINIMUM_NECESSARY_REQUIRED";
}

const restrictedRoles: Record<SecurityDomain, readonly string[]> = {
  PERKES: ["PERKES", "PERKES_OPERATOR", "PERKES_ADMIN", "PEJABAT_APPROVER"],
  AUDIT: ["AUDITOR", "SYSTEM_ADMIN", "SUPER_ADMIN"],
  RBAC: ["SUPER_ADMIN"],
  DETENI: [], DOCUMENTS: [], PLACEMENT: [], MOVEMENT: [], HEADCOUNT: [], KAMTIB: [], RAP: [],
  TEMPORARY_EXIT: [], ESCORT: [], DOCUMENT_ENGINE: [], APPROVAL: [], LEADERSHIP: [],
  NOTIFICATION: [], REPORTING: [], INTAKE: [], SYSTEM: [],
};

export function evaluateRestrictedAccess(request: RestrictedAccessRequest): RestrictedAccessDecision {
  const roles = restrictedRoles[request.domain];
  if (roles.length > 0 && !request.subject.roles.some((role) => roles.includes(role))) {
    return { allowed: false, reason: "ROLE_REQUIRED" };
  }
  if (!request.purpose?.trim()) {
    return { allowed: false, reason: "PURPOSE_REQUIRED" };
  }
  if (!request.minimumNecessary) {
    return { allowed: false, reason: "MINIMUM_NECESSARY_REQUIRED" };
  }
  return { allowed: true, reason: "ALLOWED" };
}
