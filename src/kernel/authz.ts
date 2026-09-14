export type AuthenticatedContext = Readonly<{
  userId: string;
  sessionId: string;
  active: boolean;
}>;

export type AuthorizationInput = Readonly<{
  auth: AuthenticatedContext | null;
  permission: string;
  permissions: readonly string[];
  scope: string;
  allowedScopes: readonly string[];
  operationalAssignment: string | null;
  requiredAssignment?: string;
  dutyActive: boolean;
  classificationAllowed: boolean;
  resourceExists: boolean;
  stateValid: boolean;
  policyAllowed: boolean;
  isSuperAdmin: boolean;
  superAdminOperationalBypass: boolean;
}>;

export type AuthorizationDecision = Readonly<{
  allowed: boolean;
  reasonCode: string;
  policyVersion: string;
}>;

export function authorize(input: AuthorizationInput): AuthorizationDecision {
  const deny = (reasonCode: string): AuthorizationDecision => ({ allowed: false, reasonCode, policyVersion: 'AUTHZ-1.0' });

  if (!input.auth?.active) return deny('AUTH_REQUIRED');
  if (!input.permissions.includes(input.permission)) return deny('PERMISSION_DENIED');
  if (!input.allowedScopes.includes(input.scope)) return deny('SCOPE_DENIED');
  if (input.requiredAssignment && input.operationalAssignment !== input.requiredAssignment) return deny('DUTY_REQUIRED');
  if (input.requiredAssignment && !input.dutyActive) return deny('DUTY_INACTIVE');
  if (!input.classificationAllowed) return deny('RESOURCE_CLASSIFICATION_DENIED');
  if (!input.resourceExists) return deny('RESOURCE_NOT_FOUND');
  if (!input.stateValid) return deny('INVALID_STATE');
  if (!input.policyAllowed) return deny('POLICY_DENIED');
  if (input.isSuperAdmin && input.superAdminOperationalBypass) return deny('SUPER_ADMIN_OPERATIONAL_BYPASS');

  return { allowed: true, reasonCode: 'ALLOW', policyVersion: 'AUTHZ-1.0' };
}
