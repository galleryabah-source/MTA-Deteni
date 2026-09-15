import assert from "node:assert/strict";
import test from "node:test";
import {
  composeSyntheticEvidencePacket,
  defaultSyntheticVerificationSteps,
  validateHarnessShape,
} from "../src/application/verification-harness.js";
import { evaluateSyntheticEvidencePacket } from "../src/application/synthetic-release-evidence.js";

const steps = defaultSyntheticVerificationSteps();

test("P10.969-972 define the controlled synthetic command sequence", () => {
  assert.deepEqual(steps.map((step) => step.command), [
    "npm install --ignore-scripts --no-audit --no-fund",
    "npm run typecheck",
    "npm test",
    "npm run test:unit",
  ]);
});

test("P10.973-980 compose observations without fabricating execution", () => {
  const result = composeSyntheticEvidencePacket("HARNESS-001", steps.map((step) => ({
    step,
    status: "NOT_RUN",
    exitCode: null,
    outputDigest: "synthetic://not-run",
  })));
  assert.equal(validateHarnessShape(result), "READY");
  assert.equal(evaluateSyntheticEvidencePacket(result.packet), "BLOCKED");
});

test("P10.981-988 require PASS to have zero exit code", () => {
  const result = composeSyntheticEvidencePacket("HARNESS-002", [{
    step: steps[1], status: "PASS", exitCode: 1, outputDigest: "synthetic://bad-exit",
  }]);
  assert.equal(validateHarnessShape(result), "READY");
  assert.equal(evaluateSyntheticEvidencePacket(result.packet), "BLOCKED");
});

test("P10.989-996 reject packet/observation identity drift", () => {
  const result = composeSyntheticEvidencePacket("HARNESS-003", [{
    step: steps[2], status: "PASS", exitCode: 0, outputDigest: "synthetic://ok",
  }]);
  const tampered = { ...result, packet: { ...result.packet, packetId: "OTHER" } };
  assert.equal(validateHarnessShape(tampered), "BLOCKED");
});

test("P10.997-1000 keep evidence target synthetic-only", () => {
  const result = composeSyntheticEvidencePacket("HARNESS-004", [{
    step: steps[0], status: "PASS", exitCode: 0, outputDigest: "synthetic://ok",
  }]);
  assert.equal(result.target, "SYNTHETIC");
  assert.equal(result.packet.target, "SYNTHETIC");
  assert.equal(result.packet.controls[0]?.target, "SYNTHETIC");
});
