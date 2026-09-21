export type PersistenceSecurityDomain =
  | "DETENI"
  | "DOCUMENTS"
  | "MOVEMENT"
  | "HEADCOUNT"
  | "KAMTIB"
  | "RAP"
  | "PERKES"
  | "TEMPORARY_EXIT"
  | "ESCORT"
  | "APPROVAL"
  | "LEADERSHIP"
  | "AUDIT"
  | "RBAC"
  | "SYSTEM";

export type PersistenceAccessMode = "READ" | "WRITE" | "APPROVE" | "ISSUE" | "EXPORT" | "ADMIN";

export interface PersistenceAuthorizationContext {
  readonly userId: string;
  readonly roles: readonly string[];
  readonly unitId?: string;
  readonly domain: PersistenceSecurityDomain;
  readonly mode: PersistenceAccessMode;
  readonly resourceOwnerUnitId?: string;
  readonly resourceOwnerUserId?: string;
  readonly classification?: "PUBLIC" | "INTERNAL" | "RESTRICTED" | "HIGHLY_RESTRICTED";
  readonly purpose?: string;
  readonly breakGlass?: boolean;
}

export interface RlsPolicyContract {
  readonly denyByDefault: true;
  readonly unitIsolation: true;
  readonly ownershipIsolation: true;
  readonly restrictedDomainIsolation: true;
  readonly serviceAuthorizationRequired: true;
  readonly superAdminBypass: false;
}

export const MTA_DETENI_RLS_CONTRACT: RlsPolicyContract = Object.freeze({
  denyByDefault: true,
  unitIsolation: true,
  ownershipIsolation: true,
  restrictedDomainIsolation: true,
  serviceAuthorizationRequired: true,
  superAdminBypass: false,
});

export const assertPersistenceAuthorizationContext = (context: PersistenceAuthorizationContext): void => {
  if (!context.userId.trim()) throw new Error("INVALID_AUTHORIZATION_USER");
  if (context.roles.length === 0) throw new Error("NO_AUTHORIZATION_ROLES");
  if (!context.domain || !context.mode) throw new Error("INVALID_AUTHORIZATION_SCOPE");
  if ((context.classification === "RESTRICTED" || context.classification === "HIGHLY_RESTRICTED") && !context.purpose?.trim()) {
    throw new Error("PURPOSE_REQUIRED_FOR_RESTRICTED_DATA");
  }
};

export const assertUnitIsolation = (context: PersistenceAuthorizationContext): void => {
  if (context.resourceOwnerUnitId && context.unitId !== context.resourceOwnerUnitId && !context.roles.includes("AUDITOR")) {
    throw new Error("UNIT_SCOPE_DENIED");
  }
};

export const assertNoSuperAdminBypass = (roles: readonly string[]): void => {
  if (roles.includes("SUPER_ADMIN")) throw new Error("SUPER_ADMIN_PERSISTENCE_BYPASS_FORBIDDEN");
};
