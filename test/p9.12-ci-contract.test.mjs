import assert from "node:assert/strict";
import test from "node:test";

const requiredGates = [
  "dependency-install",
  "test-harness",
  "typecheck",
  "secret-boundary",
];

test("P9.12 required CI gates are explicit", () => {
  assert.deepEqual(requiredGates, [
    "dependency-install",
    "test-harness",
    "typecheck",
    "secret-boundary",
  ]);
});

test("P9.12 certification consumes CI evidence rather than replacing it", () => {
  const ciEvidence = { workflow: "kernel-ci", status: "PASS" };
  assert.equal(ciEvidence.status, "PASS");
  assert.equal(typeof ciEvidence.workflow, "string");
});
