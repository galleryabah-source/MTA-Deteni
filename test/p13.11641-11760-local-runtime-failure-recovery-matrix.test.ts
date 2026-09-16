import assert from "node:assert/strict";
import test from "node:test";
import { assertLocalRuntimeFailureMatrixCase, getLocalRuntimeFailureMatrix, resolveLocalRuntimeRecoveryDisposition } from "../src/application/local-runtime-failure-recovery-matrix.js";

test("P13.11641-11760: all deterministic failure scenarios have bounded recovery dispositions", () => {
  const matrix = getLocalRuntimeFailureMatrix();
  assert.equal(matrix.length, 5);
  for (const entry of matrix) {
    assertLocalRuntimeFailureMatrixCase(entry);
    assert.equal(entry.syntheticOnly, true);
    assert.equal(entry.responseStatus, "REJECTED");
    assert.deepEqual(resolveLocalRuntimeRecoveryDisposition({ scenario: entry.scenario, failureClass: entry.failureClass }), entry);
  }
});

test("P13.11641-11760: scenario/class mismatch fails closed", () => {
  assert.throws(() => resolveLocalRuntimeRecoveryDisposition({ scenario: "EXPIRED_HANDSHAKE", failureClass: "REQUEST_REJECTED" }), /scenario\/class mismatch/i);
});
