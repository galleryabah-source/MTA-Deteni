import test from "node:test";
import assert from "node:assert/strict";
import { buildActivationEvidencePacket } from "../src/infrastructure/certification/activation-evidence-packet.mjs";

const base = Object.fromEntries([
  "runtimeReadiness",
  "operatorApproval",
  "changeWindow",
  "rollbackVerified",
  "observabilityReady",
  "backupVerified",
  "securityPassed",
  "artifactIntegrityPassed",
].map((x) => [x, true]));

test("P10.309 builds a complete activation evidence packet", () => {
  assert.equal(buildActivationEvidencePacket(base).status, "ACTIVATION_EVIDENCE_COMPLETE");
});

for (const [i,key] of [
  [310,"operatorApproval"],
  [311,"changeWindow"],
  [312,"rollbackVerified"],
  [313,"observabilityReady"],
  [314,"backupVerified"],
  [315,"securityPassed"],
  [316,"artifactIntegrityPassed"],
]) {
  test(`P10.${i} requires ${key}`, () => {
    assert.throws(() => buildActivationEvidencePacket({ ...base, [key]: false }), new RegExp(`ACTIVATION_EVIDENCE_MISSING:${key}`));
  });
}

test("activation evidence never authorizes production", () => {
  const result = buildActivationEvidencePacket(base);
  assert.equal(result.controls.executionAuthorized, false);
  assert.equal(result.controls.productionCertified, false);
});
