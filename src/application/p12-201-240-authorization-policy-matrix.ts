import type { DomainName } from "../domain/shared/contracts.js";

export type OperationalPermission =
  | "DETAINEE_REGISTER"
  | "DETAINEE_ADMINISTER"
  | "REPORT_GENERATE"
  | "HEALTH_RECORD_MANAGE"
  | "HEALTH_WORKFLOW_MANAGE"
  | "PLACEMENT_MANAGE"
  | "MOVEMENT_MANAGE"
  | "HEADCOUNT_CAPTURE"
  | "TEMPORARY_EXIT_VALIDATE"
  | "TEMPORARY_EXIT_APPROVE"
  | "ESCORT_ASSIGN"
  | "OPERATIONAL_QR_SCAN"
  | "ESCORT_DOCUMENT_ADMINISTER"
  | "OVERSIGHT_READ"
  | "OVERSIGHT_DIRECTIVE";

const policy: Readonly<Record<DomainName, readonly OperationalPermission[]>> = {
  RAP: ["DETAINEE_REGISTER", "DETAINEE_ADMINISTER", "REPORT_GENERATE"],
  PERKES: ["HEALTH_RECORD_MANAGE", "HEALTH_WORKFLOW_MANAGE"],
  KAMTIB: ["PLACEMENT_MANAGE", "MOVEMENT_MANAGE", "HEADCOUNT_CAPTURE", "TEMPORARY_EXIT_VALIDATE", "ESCORT_ASSIGN", "OPERATIONAL_QR_SCAN"],
  SUBBAG_TU: ["ESCORT_DOCUMENT_ADMINISTER"],
  HEAD_RUDENIM: ["OVERSIGHT_READ", "OVERSIGHT_DIRECTIVE"],
};

export function isPermissionDeclared(domain: DomainName, permission: string): boolean {
  const declared = policy[domain as DomainName];
  return declared !== undefined && declared.includes(permission as OperationalPermission);
}

export function authorizeByPolicy(domain: DomainName, permission: string): boolean {
  return isPermissionDeclared(domain, permission);
}

export function policyMatrix(): Readonly<Record<DomainName, readonly OperationalPermission[]>> {
  return policy;
}

export function assertLeadershipReadOnlyOperational(domain: DomainName, permission: OperationalPermission): void {
  if (domain === "HEAD_RUDENIM" && !["OVERSIGHT_READ", "OVERSIGHT_DIRECTIVE"].includes(permission)) {
    throw new Error("LEADERSHIP_OPERATIONAL_EDIT_FORBIDDEN");
  }
}
