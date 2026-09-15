import assert from "node:assert/strict";
import test from "node:test";
import { createApplicationSurface } from "../src/application/application-surface.js";
import { evaluateApplicationBoundary, evaluateApplicationBoundaryGate } from "../src/application/p11-001-032-regression-gate.js";

test("P11.001-032 application boundary passes for every supported surface", () => {
  for (const surface of ["DASHBOARD", "DETAINEE", "MOVEMENT", "TEMPORARY_EXIT", "QR", "REPORTS"] as const) {
    const gate = evaluateApplicationBoundary(createApplicationSurface(surface), `GATE-${surface}`);
    assert.equal(evaluateApplicationBoundaryGate(gate), "READY");
  }
});

test("P11.009-016 mutation actions remain server-bound", () => {
  const surface = createApplicationSurface("TEMPORARY_EXIT");
  const gate = evaluateApplicationBoundary({
    ...surface,
    readModel: { ...surface.readModel, actions: [{ id: " ", label: "Mutate", method: "MUTATE" }] },
  }, "GATE-MUTATION");
  assert.equal(gate.checks.find((check) => check.control === "mutation-server-boundary")?.status, "FAIL");
  assert.equal(evaluateApplicationBoundaryGate(gate), "BLOCKED");
});

test("P11.017-024 malformed gate shape fails closed", () => {
  const surface = createApplicationSurface("QR");
  const gate = evaluateApplicationBoundary(surface, "GATE-QR");
  assert.equal(evaluateApplicationBoundaryGate({ ...gate, checks: gate.checks.slice(0, 3) }), "BLOCKED");
});
