import assert from "node:assert/strict";
import test from "node:test";
import {
  createSyntheticExecutionEvidence,
  evaluateSyntheticEvidencePacket,
} from "../src/application/synthetic-release-evidence.js";
import {
  createSyntheticReleaseCheck,
  evaluateReleaseCandidate,
} from "../src/application/release-candidate.js";

test("P10.937-944 release matrix rejects blank identity and evidence", () => {
  assert.equal(evaluateReleaseCandidate({ matrixId: "", target: "SYNTHETIC", checks: [createSyntheticReleaseCheck("P10.937", "ui")] }), "BLOCKED");
  const check = createSyntheticReleaseCheck("P10.937", "ui");
  assert.equal(evaluateReleaseCandidate({ matrixId: "RC-1", target: "SYNTHETIC", checks: [{ ...check, evidenceRef: " " }] }), "BLOCKED");
});

test("P10.945-952 synthetic execution evidence requires an actual PASS-shaped result", () => {
  const evidence = createSyntheticExecutionEvidence("P10.945", "typecheck", "npm run typecheck");
  assert.equal(evidence.target, "SYNTHETIC");
  assert.equal(evidence.exitCode, 0);
  assert.equal(evaluateSyntheticEvidencePacket({ packetId: "SYN-EXEC-001", target: "SYNTHETIC", generatedAt: new Date(0).toISOString(), controls: [evidence] }), "READY");
});

test("P10.953-960 evidence gate fails closed on NOT_RUN, non-zero exit, or missing digest", () => {
  const base = createSyntheticExecutionEvidence("P10.953", "tests", "npm test");
  assert.equal(evaluateSyntheticEvidencePacket({ packetId: "BLOCKED", target: "SYNTHETIC", generatedAt: new Date(0).toISOString(), controls: [{ ...base, status: "NOT_RUN" }] }), "BLOCKED");
  assert.equal(evaluateSyntheticEvidencePacket({ packetId: "BLOCKED", target: "SYNTHETIC", generatedAt: new Date(0).toISOString(), controls: [{ ...base, exitCode: 1 }] }), "BLOCKED");
  assert.equal(evaluateSyntheticEvidencePacket({ packetId: "BLOCKED", target: "SYNTHETIC", generatedAt: new Date(0).toISOString(), controls: [{ ...base, outputDigest: " " }] }), "BLOCKED");
});

test("P10.961-968 packet remains synthetic-only", () => {
  const evidence = createSyntheticExecutionEvidence("P10.961", "boundary", "synthetic-check");
  assert.equal(evaluateSyntheticEvidencePacket({ packetId: "SYN-BOUNDARY", target: "SYNTHETIC", generatedAt: new Date(0).toISOString(), controls: [evidence] }), "READY");
});
