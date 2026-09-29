import test from "node:test";
import assert from "node:assert/strict";
import { P96_AUTHORIZATION_ERRORS, assertP96AuthorizationMatrix, evaluateP96Authorization } from "../p9.6/authorization-matrix.mjs";

const OWNER = "00000000-0000-4000-8000-000000000001";
const ADMIN = "00000000-0000-4000-8000-000000000002";
const SCOPE_A = "scope-a";
const SCOPE_B = "scope-b";

const base = {
  profile: { id: OWNER, role: "OWNER", active: true },
  requestedScopeId: SCOPE_A,
  resourceScopeId: SCOPE_A,
  memberships: [{ profileId: OWNER, scopeId: SCOPE_A, active: true, expectedRole: "OWNER" }],
};

test("P9.6 matrix defines all required authorization outcomes", () => {
  assert.deepEqual(P96_AUTHORIZATION_ERRORS, [
    "SCOPE_REQUIRED",
    "SCOPE_DENIED",
    "WRONG_SCOPE",
    "INACTIVE_MEMBERSHIP",
    "ROLE_DRIFT",
    "CROSS_SCOPE_ACCESS",
  ]);
});

test("P9.6 positive authorization: active OWNER membership grants same-scope access", () => {
  assert.deepEqual(evaluateP96Authorization(base), { ok: true, code: "AUTHORIZED", scopeId: SCOPE_A, role: "OWNER" });
});

test("P9.6 positive authorization: active ADMIN membership grants same-scope access", () => {
  assertP96AuthorizationMatrix({
    ...base,
    profile: { id: ADMIN, role: "ADMIN", active: true },
    memberships: [{ profileId: ADMIN, scopeId: SCOPE_A, active: true, expectedRole: "ADMIN" }],
  }, "AUTHORIZED");
});

test("P9.6 SCOPE_REQUIRED: scoped operation without requested scope is rejected", () => {
  assertP96AuthorizationMatrix({ ...base, requestedScopeId: "" }, "SCOPE_REQUIRED");
});

test("P9.6 SCOPE_DENIED: active profile with disallowed role is rejected", () => {
  assertP96AuthorizationMatrix({
    ...base,
    profile: { id: OWNER, role: "VIEWER", active: true },
  }, "SCOPE_DENIED");
});

test("P9.6 WRONG_SCOPE: membership exists only for a different scope", () => {
  assertP96AuthorizationMatrix({
    ...base,
    requestedScopeId: SCOPE_B,
    resourceScopeId: SCOPE_B,
    memberships: [{ profileId: OWNER, scopeId: SCOPE_A, active: true, expectedRole: "OWNER" }],
  }, "WRONG_SCOPE");
});

test("P9.6 INACTIVE_MEMBERSHIP: matching membership is inactive", () => {
  assertP96AuthorizationMatrix({
    ...base,
    memberships: [{ profileId: OWNER, scopeId: SCOPE_A, active: false, expectedRole: "OWNER" }],
  }, "INACTIVE_MEMBERSHIP");
});

test("P9.6 ROLE_DRIFT: active membership expectation no longer matches profile role", () => {
  assertP96AuthorizationMatrix({
    ...base,
    profile: { id: OWNER, role: "ADMIN", active: true },
  }, "ROLE_DRIFT");
});

test("P9.6 CROSS_SCOPE_ACCESS: authorized membership cannot cross resource scope", () => {
  assertP96AuthorizationMatrix({
    ...base,
    resourceScopeId: SCOPE_B,
  }, "CROSS_SCOPE_ACCESS");
});

test("P9.6 fail-closed: missing profile cannot authorize", () => {
  assertP96AuthorizationMatrix({ ...base, profile: null }, "SCOPE_DENIED");
});
