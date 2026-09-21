import test from "node:test";
import assert from "node:assert/strict";
import { evaluateReleaseCandidate } from "../src/infrastructure/certification/release-candidate-gate.mjs";

const base = Object.fromEntries([
  "activationEvidenceComplete",
  "changeControlComplete",
  "artifactFingerprintValid",
  "rollbackReferenceValid",
  "securityEvidenceValid",
  "observabilityEvidenceValid",
  "backupEvidenceValid",
  "productionTargetExplicit",
].map((x) => [x, true]));

test("P10.325 builds a release candidate readiness result", () => {
  assert.equal(evaluateReleaseCandidate(base).status, "RELEASE_CANDIDATE_READY_FOR_GOVERNED_REVIEW");
});

for (const [i,key] of [
  [326,"changeControlComplete"],
  [327,"artifactFingerprintValid"],
  [328,"rollbackReferenceValid"],
  [329,"securityEvidenceValid"],
  [330,"observabilityEvidenceValid"],
  [331,"backupEvidenceValid"],
  [332,"productionTargetExplicit"],
]) {
  test(`P10.${i} blocks missing ${key}`, () => {
    const result = evaluateReleaseCandidate({ ...base, [key]: false });
    assert.equal(result.status, "RELEASE_CANDIDATE_BLOCKED");
    assert.match(result.reason, new RegExp(key));
  });
}

test("release candidate never grants production authorization", () => {
  const result = evaluateReleaseCandidate(base);
  assert.equal(result.controls.executionAuthorized, false);
  assert.equal(result.controls.productionCertified, false);
});
