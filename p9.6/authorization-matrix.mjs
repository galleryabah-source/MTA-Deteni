export const P96_AUTHORIZATION_ERRORS = Object.freeze([
  "SCOPE_REQUIRED",
  "SCOPE_DENIED",
  "WRONG_SCOPE",
  "INACTIVE_MEMBERSHIP",
  "ROLE_DRIFT",
  "CROSS_SCOPE_ACCESS",
]);

export const P96_ALLOWED_ROLES = Object.freeze(["OWNER", "ADMIN"]);

function normalize(value) {
  return String(value ?? "").trim();
}

function hasActiveMembership(memberships, profileId, scopeId) {
  return memberships.some((m) =>
    normalize(m.profileId) === normalize(profileId) &&
    normalize(m.scopeId) === normalize(scopeId) &&
    m.active === true
  );
}

function hasMembership(memberships, profileId, scopeId) {
  return memberships.some((m) =>
    normalize(m.profileId) === normalize(profileId) &&
    normalize(m.scopeId) === normalize(scopeId)
  );
}

/**
 * Deterministic P9.6 authorization contract evaluator.
 *
 * This is a policy oracle for controlled non-production certification; it does
 * not mutate production data and never infers scope from role.
 */
export function evaluateP96Authorization(input) {
  const profileId = normalize(input?.profile?.id);
  const role = normalize(input?.profile?.role).toUpperCase();
  const profileActive = input?.profile?.active === true;
  const requestedScopeId = normalize(input?.requestedScopeId);
  const resourceScopeId = normalize(input?.resourceScopeId);
  const memberships = Array.isArray(input?.memberships) ? input.memberships : [];

  if (!requestedScopeId) {
    return { ok: false, code: "SCOPE_REQUIRED" };
  }

  if (!profileId || !profileActive) {
    return { ok: false, code: "SCOPE_DENIED" };
  }

  if (!P96_ALLOWED_ROLES.includes(role)) {
    return { ok: false, code: "SCOPE_DENIED" };
  }

  if (!hasMembership(memberships, profileId, requestedScopeId)) {
    const hasOtherScope = memberships.some((m) =>
      normalize(m.profileId) === profileId && normalize(m.scopeId) && normalize(m.scopeId) !== requestedScopeId
    );
    return { ok: false, code: hasOtherScope ? "WRONG_SCOPE" : "SCOPE_DENIED" };
  }

  if (!hasActiveMembership(memberships, profileId, requestedScopeId)) {
    return { ok: false, code: "INACTIVE_MEMBERSHIP" };
  }

  const assignedRole = memberships.find((m) =>
    normalize(m.profileId) === profileId && normalize(m.scopeId) === requestedScopeId
  )?.expectedRole;
  if (assignedRole && normalize(assignedRole).toUpperCase() !== role) {
    return { ok: false, code: "ROLE_DRIFT" };
  }

  if (!resourceScopeId) {
    return { ok: false, code: "SCOPE_REQUIRED" };
  }

  if (resourceScopeId !== requestedScopeId) {
    return { ok: false, code: "CROSS_SCOPE_ACCESS" };
  }

  return { ok: true, code: "AUTHORIZED", scopeId: requestedScopeId, role };
}

export function assertP96AuthorizationMatrix(input, expectedCode) {
  const result = evaluateP96Authorization(input);
  if (result.code !== expectedCode) {
    const error = new Error(`P9.6_AUTHORIZATION_MATRIX_MISMATCH:${expectedCode}:${result.code}`);
    error.code = "P9.6_AUTHORIZATION_MATRIX_MISMATCH";
    error.expected = expectedCode;
    error.actual = result.code;
    throw error;
  }
  return result;
}
