import test from "node:test";
import assert from "node:assert/strict";
import { ALLOWED_SCOPE_ROLES, buildProvisioningPlan, validateCanonicalScopeProvisioningManifest } from "../p9.6/canonical-scope-provisioning.mjs";

const valid = {
  scope: { code: "EXPLICIT-CODE", name: "Explicit Scope", active: true },
  assignments: [
    { profileId: "owner-profile-id", expectedRole: "OWNER", active: true },
    { profileId: "admin-profile-id", expectedRole: "ADMIN", active: true },
  ],
};

test("scope provisioning requires explicit identity", () => {
  const result = validateCanonicalScopeProvisioningManifest({ assignments: valid.assignments });
  assert.equal(result.ok, false);
  assert.ok(result.errors.includes("SCOPE_CODE_REQUIRED"));
  assert.ok(result.errors.includes("SCOPE_NAME_REQUIRED"));
});

test("scope provisioning allows only explicit OWNER/ADMIN assignments", () => {
  const result = validateCanonicalScopeProvisioningManifest(valid);
  assert.equal(result.ok, true);
  assert.deepEqual(ALLOWED_SCOPE_ROLES, ["OWNER", "ADMIN"]);
});

test("scope provisioning rejects duplicate profile membership", () => {
  const result = validateCanonicalScopeProvisioningManifest({
    ...valid,
    assignments: [valid.assignments[0], { ...valid.assignments[0], expectedRole: "ADMIN" }],
  });
  assert.equal(result.ok, false);
  assert.ok(result.errors.includes("ASSIGNMENT_1_PROFILE_DUPLICATE"));
});

test("scope provisioning rejects unsupported roles", () => {
  const result = validateCanonicalScopeProvisioningManifest({
    ...valid,
    assignments: [{ profileId: "x", expectedRole: "SUPER_ADMIN", active: true }],
  });
  assert.equal(result.ok, false);
  assert.ok(result.errors.includes("ASSIGNMENT_0_ROLE_INVALID"));
});

test("provisioning plan is explicitly non-production", () => {
  const plan = buildProvisioningPlan(valid);
  assert.equal(plan.mode, "CONTROLLED_NONPROD_ONLY");
  assert.equal(plan.productionAllowed, false);
  assert.equal(plan.migrationExecuted, false);
  assert.match(plan.invariants.join(" "), /role-to-scope shortcut/);
});
