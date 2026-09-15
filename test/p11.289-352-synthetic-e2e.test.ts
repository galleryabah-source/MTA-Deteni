import assert from "node:assert/strict";
import test from "node:test";
import { evaluateSyntheticE2E } from "../src/application/p11-289-352-synthetic-e2e.js";

test("P11.289-320 accepts complete synthetic cross-domain flow", () => {
  const contract = { contractId: "E2E-001", target: "SYNTHETIC" as const, observations: [
    { checkpoint: "P11.289", detaineeId: "SYN-D-010", placement: "EXITED" as const, headcount: 9, qrContext: "TEMPORARY_EXIT" as const, qrValidity: "ACTIVE" as const },
    { checkpoint: "P11.297", detaineeId: "SYN-D-010", placement: "RETURNED" as const, headcount: 10, qrContext: "RUDENIM_STAY" as const, qrValidity: "ACTIVE" as const },
  ] };
  const run = { runId: "RUN-001", target: "SYNTHETIC" as const, steps: [
    { checkpoint: "P11.289", name: "departure", status: "PASS" as const },
    { checkpoint: "P11.297", name: "return", status: "PASS" as const },
  ] };
  assert.equal(evaluateSyntheticE2E(contract, run), "READY");
});

test("P11.321-352 blocks failed E2E step", () => {
  const contract = { contractId: "E2E-002", target: "SYNTHETIC" as const, observations: [{ checkpoint: "P11.321", detaineeId: "SYN-D-011", placement: "PLACED" as const, headcount: 10, qrContext: "RUDENIM_STAY" as const, qrValidity: "ACTIVE" as const }] };
  const run = { runId: "RUN-002", target: "SYNTHETIC" as const, steps: [{ checkpoint: "P11.321", name: "placement", status: "FAIL" as const }] };
  assert.equal(evaluateSyntheticE2E(contract, run), "BLOCKED");
});
