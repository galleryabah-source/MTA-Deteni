import assert from "node:assert/strict";
import test from "node:test";
import { createApplicationSurface } from "../src/application/application-surface.js";
import { evaluateApplicationBoundary } from "../src/application/p11-001-032-regression-gate.js";
import { composeIntegratedVerificationGate, assertIntegratedVerificationGate } from "../src/application/p11-065-096-release-composition.js";
import { createSyntheticExecutionEvidence } from "../src/application/synthetic-release-evidence.js";

test("P11.065-096 integrated synthetic gate composes only when both boundaries are ready", () => {
  const appGate = evaluateApplicationBoundary(createApplicationSurface("DASHBOARD"), "APP-001");
  const evidence = createSyntheticExecutionEvidence("P11.065", "harness", "synthetic-verification");
  const gate = composeIntegratedVerificationGate("INT-001", appGate, { packetId: "PACKET-001", target: "SYNTHETIC", generatedAt: new Date(0).toISOString(), controls: [evidence] });
  assert.equal(assertIntegratedVerificationGate(gate), "READY");
});

test("P11.081-096 integrated gate fails closed when evidence is not ready", () => {
  const appGate = evaluateApplicationBoundary(createApplicationSurface("QR"), "APP-002");
  const evidence = createSyntheticExecutionEvidence("P11.081", "harness", "synthetic-verification", "NOT_RUN", null, "synthetic://pending");
  const gate = composeIntegratedVerificationGate("INT-002", appGate, { packetId: "PACKET-002", target: "SYNTHETIC", generatedAt: new Date(0).toISOString(), controls: [evidence] });
  assert.equal(assertIntegratedVerificationGate(gate), "BLOCKED");
  assert.ok(gate.findings.includes("execution-evidence-blocked"));
});
