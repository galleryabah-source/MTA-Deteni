export const ALLOWED_SCOPE_ROLES = Object.freeze(["OWNER", "ADMIN"]);

export function validateCanonicalScopeProvisioningManifest(input) {
  const errors = [];
  const scope = input?.scope;
  const assignments = Array.isArray(input?.assignments) ? input.assignments : null;

  if (!scope || typeof scope !== "object") errors.push("SCOPE_MANIFEST_REQUIRED");
  if (!String(scope?.code ?? "").trim()) errors.push("SCOPE_CODE_REQUIRED");
  if (!String(scope?.name ?? "").trim()) errors.push("SCOPE_NAME_REQUIRED");
  if (String(scope?.code ?? "").trim().length > 80) errors.push("SCOPE_CODE_TOO_LONG");
  if (String(scope?.name ?? "").trim().length > 160) errors.push("SCOPE_NAME_TOO_LONG");
  if (!assignments) errors.push("SCOPE_ASSIGNMENTS_REQUIRED");
  else if (assignments.length === 0) errors.push("SCOPE_ASSIGNMENTS_EMPTY");

  const seenProfiles = new Set();
  for (const [index, assignment] of (assignments ?? []).entries()) {
    const profileId = String(assignment?.profileId ?? "").trim();
    const expectedRole = String(assignment?.expectedRole ?? "").trim().toUpperCase();
    if (!profileId) errors.push("ASSIGNMENT_" + index + "_PROFILE_ID_REQUIRED");
    if (!ALLOWED_SCOPE_ROLES.includes(expectedRole)) errors.push("ASSIGNMENT_" + index + "_ROLE_INVALID");
    if (seenProfiles.has(profileId)) errors.push("ASSIGNMENT_" + index + "_PROFILE_DUPLICATE");
    if (profileId) seenProfiles.add(profileId);
    if (assignment?.active !== true) errors.push("ASSIGNMENT_" + index + "_MUST_BE_ACTIVE");
  }

  return {
    ok: errors.length === 0,
    errors,
    normalized: errors.length === 0 ? {
      scope: { code: String(scope.code).trim(), name: String(scope.name).trim(), active: scope.active !== false },
      assignments: assignments.map((assignment) => ({ profileId: String(assignment.profileId).trim(), expectedRole: String(assignment.expectedRole).trim().toUpperCase(), active: true })),
    } : null,
  };
}

export function buildProvisioningPlan(manifest) {
  const validation = validateCanonicalScopeProvisioningManifest(manifest);
  if (!validation.ok) {
    const error = new Error("CANONICAL_SCOPE_PROVISIONING_MANIFEST_INVALID");
    error.code = "CANONICAL_SCOPE_PROVISIONING_MANIFEST_INVALID";
    error.details = validation.errors;
    throw error;
  }
  return Object.freeze({
    mode: "CONTROLLED_NONPROD_ONLY",
    mutation: "TRANSACTIONAL",
    productionAllowed: false,
    migrationExecuted: false,
    scope: validation.normalized.scope,
    assignments: validation.normalized.assignments,
    invariants: [
      "scope code and name must be explicit",
      "scope identity is never inferred from role",
      "assignment profile IDs must be explicit",
      "assignment role is verified against mta_profiles before mutation",
      "OWNER/ADMIN assignment is membership data, not a role-to-scope shortcut",
      "duplicate profile assignment is rejected",
      "production execution is prohibited by this contract",
    ],
  });
}