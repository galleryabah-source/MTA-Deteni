export const SECURITY_ADVERSARIAL_VERSION = "SECURITY-ADVERSARIAL-v1";

export type SecurityBoundaryInput = Readonly<{
  name: string;
  authenticated: boolean;
  roleAllowed: boolean;
  permissionAllowed: boolean;
  scopeAllowed: boolean;
  dutyActive: boolean;
  resourceBound: boolean;
  stateAllowed: boolean;
  policyAllowed: boolean;
  segregationOfDutiesAllowed: boolean;
  authorizationVersionCurrent: boolean;
  apiBoundaryEnforced: boolean;
}>;

export type SecurityBoundaryResult = Readonly<{
  version: typeof SECURITY_ADVERSARIAL_VERSION;
  name: string;
  allowed: boolean;
  expected: boolean;
  status: "PASS" | "FAIL";
}>;

export function evaluateSecurityBoundary(value: SecurityBoundaryInput): SecurityBoundaryResult {
  const allowed =
    value.authenticated &&
    value.roleAllowed &&
    value.permissionAllowed &&
    value.scopeAllowed &&
    value.dutyActive &&
    value.resourceBound &&
    value.stateAllowed &&
    value.policyAllowed &&
    value.segregationOfDutiesAllowed &&
    value.authorizationVersionCurrent &&
    value.apiBoundaryEnforced;

  const expected = value.authenticated &&
    value.roleAllowed &&
    value.permissionAllowed &&
    value.scopeAllowed &&
    value.dutyActive &&
    value.resourceBound &&
    value.stateAllowed &&
    value.policyAllowed &&
    value.segregationOfDutiesAllowed &&
    value.authorizationVersionCurrent &&
    value.apiBoundaryEnforced;

  return Object.freeze({
    version: SECURITY_ADVERSARIAL_VERSION,
    name: value.name,
    allowed,
    expected,
    status: allowed === expected ? "PASS" : "FAIL",
  });
}

export function runSecurityAdversarialSuite(
  cases: readonly SecurityBoundaryInput[],
): readonly SecurityBoundaryResult[] {
  return Object.freeze(cases.map(evaluateSecurityBoundary));
}
