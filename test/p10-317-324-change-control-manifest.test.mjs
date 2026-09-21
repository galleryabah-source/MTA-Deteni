import test from "node:test";
import assert from "node:assert/strict";
import { buildChangeControlManifest } from "../src/infrastructure/certification/change-control-manifest.mjs";

const base = {
  changeId: "CHG-MTA-001",
  releaseCommit: "a".repeat(40),
  artifactFingerprint: "b".repeat(64),
  rollbackReference: "rollback-001",
  approvedBy: "operator-001",
  approvalReason: "scheduled controlled activation review",
  executionAuthorized: false,
};

test("P10.317 builds a deterministic change-control manifest", () => {
  assert.equal(buildChangeControlManifest(base).version, "P10.317-324-v1");
});

for (const [i,key] of [
  [318,"changeId"],
  [319,"releaseCommit"],
  [320,"artifactFingerprint"],
  [321,"rollbackReference"],
  [322,"approvedBy"],
  [323,"approvalReason"],
]) {
  test(`P10.${i} requires ${key}`, () => {
    assert.throws(() => buildChangeControlManifest({ ...base, [key]: "" }), new RegExp(`CHANGE_CONTROL_FIELD_REQUIRED:${key}`));
  });
}

test("P10.324 cannot grant production authorization", () => {
  assert.throws(
    () => buildChangeControlManifest({ ...base, executionAuthorized: true }),
    /CHANGE_CONTROL_CANNOT_GRANT_EXECUTION_AUTHORIZATION/,
  );
});
