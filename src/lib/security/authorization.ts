import type {
  AuthorizationDecision,
  AuthorizationPolicy,
  AuthorizationRequest,
  PermissionDefinition,
} from "./types";

const deny = (
  request: AuthorizationRequest,
  reason: AuthorizationDecision["reason"],
  obligations: readonly string[] = [],
): AuthorizationDecision => ({
  allowed: false,
  reason,
  correlationId: request.context.correlationId,
  policyVersion: "unknown",
  obligations,
});

export class AuthorizationEngine {
  constructor(private readonly policy: AuthorizationPolicy) {}

  decide(request: AuthorizationRequest): AuthorizationDecision {
    if (request.subject.active === false) {
      return { ...deny(request, "NO_ACTIVE_SUBJECT"), policyVersion: this.policy.version };
    }

    const permission = this.policy.permissions.find(
      (candidate) => candidate.name === request.permission,
    );
    if (!permission) {
      return { ...deny(request, "PERMISSION_NOT_GRANTED"), policyVersion: this.policy.version };
    }

    if (!this.hasPermission(request, permission)) {
      return { ...deny(request, "PERMISSION_NOT_GRANTED"), policyVersion: this.policy.version };
    }

    if (permission.domain !== request.resource.domain) {
      return { ...deny(request, "DOMAIN_DENIED"), policyVersion: this.policy.version };
    }

    if (permission.requiresPurpose && !request.context.purpose?.trim()) {
      return { ...deny(request, "PURPOSE_REQUIRED", ["PURPOSE_REQUIRED"]), policyVersion: this.policy.version };
    }

    if (permission.restricted || request.resource.classification === "HIGHLY_RESTRICTED") {
      if (request.resource.domain === "PERKES" && !this.hasHealthAccess(request)) {
        return {
          ...deny(request, "RESTRICTED_DOMAIN", ["MINIMUM_NECESSARY_DISCLOSURE"]),
          policyVersion: this.policy.version,
        };
      }
    }

    if (permission.requiresSecondApproval && !request.context.secondApproverUserId) {
      return {
        ...deny(request, "SECOND_APPROVAL_REQUIRED", ["SECOND_APPROVAL"]),
        policyVersion: this.policy.version,
      };
    }

    if (request.resource.ownerUnit && request.context.unit && request.resource.ownerUnit !== request.context.unit) {
      return { ...deny(request, "UNIT_SCOPE_DENIED"), policyVersion: this.policy.version };
    }

    if (request.resource.ownerUserId && request.resource.ownerUserId !== request.subject.userId) {
      const hasCrossOwner = request.subject.roles.includes("HEAD_RUDENIM") || request.subject.roles.includes("AUDITOR");
      if (!hasCrossOwner) {
        return { ...deny(request, "OWNERSHIP_DENIED"), policyVersion: this.policy.version };
      }
    }

    return {
      allowed: true,
      reason: "GRANTED",
      correlationId: request.context.correlationId,
      policyVersion: this.policy.version,
      obligations: permission.restricted ? ["AUDIT", "MINIMUM_NECESSARY"] : ["AUDIT"],
    };
  }

  private hasPermission(
    request: AuthorizationRequest,
    permission: PermissionDefinition,
  ): boolean {
    return request.subject.roles.some((role) =>
      this.policy.rolePermissions[role]?.includes(permission.name),
    );
  }

  private hasHealthAccess(request: AuthorizationRequest): boolean {
    return request.subject.roles.some((role) =>
      ["PERKES", "PERKES_OPERATOR", "PERKES_ADMIN", "PEJABAT_APPROVER"].includes(role),
    );
  }
}
