export type ApplicationRole = "OWNER" | "ADMIN" | "EDITOR" | "REVIEWER" | "AUDITOR";
export type Capability = "DETAINEE_REGISTER" | "DETAINEE_ADMINISTER" | "REPORT_GENERATE" | "HEALTH_RECORD_MANAGE" | "HEALTH_WORKFLOW_MANAGE" | "PLACEMENT_MANAGE" | "MOVEMENT_MANAGE" | "HEADCOUNT_CAPTURE" | "TEMPORARY_EXIT_VALIDATE" | "ESCORT_ASSIGN" | "OPERATIONAL_QR_SCAN" | "ESCORT_DOCUMENT_ADMINISTER" | "OVERSIGHT_READ" | "OVERSIGHT_DIRECTIVE";

export type PermissionExpectation = Readonly<{
  role: ApplicationRole;
  capability: Capability;
  allowed: boolean;
}>;

export function assertRolePermissionRegression(expectations: readonly PermissionExpectation[]): void {
  if (expectations.length === 0) throw new Error("ROLE_PERMISSION_MATRIX_REQUIRED");
  for (const expectation of expectations) {
    if (expectation.role === "AUDITOR" && expectation.allowed && expectation.capability !== "OVERSIGHT_READ") throw new Error("AUDITOR_MUTATION_REGRESSION");
    if (expectation.role === "REVIEWER" && expectation.allowed && ["DETAINEE_REGISTER", "MOVEMENT_MANAGE", "TEMPORARY_EXIT_VALIDATE", "OPERATIONAL_QR_SCAN"].includes(expectation.capability)) throw new Error("REVIEWER_MUTATION_REGRESSION");
  }
}

export function assertLeadershipOversightExpectation(expectation: PermissionExpectation): void {
  if (expectation.role === "OWNER" && expectation.capability === "OVERSIGHT_DIRECTIVE" && !expectation.allowed) throw new Error("OWNER_DIRECTIVE_EXPECTATION_INVALID");
}
