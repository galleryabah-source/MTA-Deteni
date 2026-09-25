import assert from "node:assert/strict";
import test from "node:test";
import { runSecurityAdversarialSuite } from "../src/application/security-adversarial-certification.js";

const valid = {
  name: "canonical allowed operation",
  authenticated: true,
  roleAllowed: true,
  permissionAllowed: true,
  scopeAllowed: true,
  dutyActive: true,
  resourceBound: true,
  stateAllowed: true,
  policyAllowed: true,
  segregationOfDutiesAllowed: true,
  authorizationVersionCurrent: true,
  apiBoundaryEnforced: true,
} as const;

function denied(name: string, key: keyof typeof valid) {
  return { ...valid, name, [key]: false };
}

test("security adversarial: canonical authorization requires every boundary", () => {
  const results = runSecurityAdversarialSuite([
    valid,
    denied("unauthenticated", "authenticated"),
    denied("wrong role", "roleAllowed"),
    denied("permission denied", "permissionAllowed"),
    denied("scope mismatch", "scopeAllowed"),
    denied("inactive duty", "dutyActive"),
    denied("resource mismatch", "resourceBound"),
    denied("invalid current state", "stateAllowed"),
    denied("policy denied", "policyAllowed"),
    denied("segregation of duties", "segregationOfDutiesAllowed"),
    denied("stale authorization version", "authorizationVersionCurrent"),
    denied("direct API bypass", "apiBoundaryEnforced"),
  ]);
  assert.equal(results.length, 12);
  assert.ok(results.every((result) => result.status === "PASS"));
  assert.equal(results[0]?.allowed, true);
  assert.ok(results.slice(1).every((result) => result.allowed === false));
});

test("security adversarial: manipulated resource identity fails closed", () => {
  const result = runSecurityAdversarialSuite([
    denied("manipulated resource id", "resourceBound"),
  ])[0];
  assert.equal(result?.status, "PASS");
  assert.equal(result?.allowed, false);
});

test("security adversarial: empty suite is deterministic and safe", () => {
  assert.deepEqual(runSecurityAdversarialSuite([]), []);
});
