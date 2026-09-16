export type SecurityDomain =
  | "DETENI"
  | "DOCUMENTS"
  | "PLACEMENT"
  | "MOVEMENT"
  | "HEADCOUNT"
  | "KAMTIB"
  | "RAP"
  | "PERKES"
  | "TEMPORARY_EXIT"
  | "ESCORT"
  | "DOCUMENT_ENGINE"
  | "APPROVAL"
  | "LEADERSHIP"
  | "NOTIFICATION"
  | "REPORTING"
  | "INTAKE"
  | "AUDIT"
  | "RBAC"
  | "SYSTEM";

export type SecurityAction =
  | "VIEW"
  | "CREATE"
  | "EDIT"
  | "VERIFY"
  | "APPROVE"
  | "ISSUE"
  | "DOWNLOAD"
  | "EXPORT"
  | "DISTRIBUTE"
  | "ARCHIVE"
  | "ADMIN";

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface AuthorizationSubject {
  userId: string;
  roles: readonly string[];
  unit?: string;
  active?: boolean;
}

export interface AuthorizationResource {
  domain: SecurityDomain;
  resourceId?: string;
  ownerUserId?: string;
  ownerUnit?: string;
  workflowState?: string;
  classification?: "PUBLIC" | "INTERNAL" | "RESTRICTED" | "HIGHLY_RESTRICTED";
}

export interface AuthorizationContext {
  purpose?: string;
  unit?: string;
  workflowState?: string;
  isBreakGlass?: boolean;
  secondApproverUserId?: string;
  correlationId: string;
}

export interface AuthorizationRequest {
  subject: AuthorizationSubject;
  permission: string;
  action: SecurityAction;
  resource: AuthorizationResource;
  context: AuthorizationContext;
}

export type AuthorizationReasonCode =
  | "GRANTED"
  | "NO_ACTIVE_SUBJECT"
  | "PERMISSION_NOT_GRANTED"
  | "DOMAIN_DENIED"
  | "UNIT_SCOPE_DENIED"
  | "OWNERSHIP_DENIED"
  | "WORKFLOW_STATE_DENIED"
  | "PURPOSE_REQUIRED"
  | "RESTRICTED_DOMAIN"
  | "BREAK_GLASS_REQUIRED"
  | "SECOND_APPROVAL_REQUIRED"
  | "POLICY_BLOCKED";

export interface AuthorizationDecision {
  allowed: boolean;
  reason: AuthorizationReasonCode;
  correlationId: string;
  policyVersion: string;
  obligations: readonly string[];
}

export interface PermissionDefinition {
  name: string;
  domain: SecurityDomain;
  action: SecurityAction;
  risk: RiskLevel;
  requiresPurpose?: boolean;
  requiresSecondApproval?: boolean;
  restricted?: boolean;
}

export interface AuthorizationPolicy {
  version: string;
  permissions: readonly PermissionDefinition[];
  rolePermissions: Readonly<Record<string, readonly string[]>>;
  protectedPermissions: readonly string[];
}
