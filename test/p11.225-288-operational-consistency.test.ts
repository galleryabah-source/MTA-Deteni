import assert from "node:assert/strict";
import test from "node:test";
import { evaluateOperationalConsistency } from "../src/application/p11-225-288-operational-consistency.js";

test("P11.225-240 accepts valid placement/headcount synthetic observations", () => {
  assert.equal(evaluateOperationalConsistency({
    contractId: "OPS-001", target: "SYNTHETIC", observations: [
      { checkpoint: "P11.225", detaineeId: "SYN-D-001", placement: "PLACED", headcount: 10, qrContext: "RUDENIM_STAY", qrValidity: "ACTIVE" },
      { checkpoint: "P11.233", detaineeId: "SYN-D-001", placement: "MOVED", headcount: 10, qrContext: "RUDENIM_STAY", qrValidity: "ACTIVE" },
    ],
  }), "READY");
});

test("P11.241-264 rejects exited detainee without active temporary-exit QR", () => {
  assert.equal(evaluateOperationalConsistency({
    contractId: "OPS-002", target: "SYNTHETIC", observations: [
      { checkpoint: "P11.249", detaineeId: "SYN-D-002", placement: "EXITED", headcount: 9, qrContext: "RUDENIM_STAY", qrValidity: "CONTEXT_MISMATCH" },
    ],
  }), "BLOCKED");
});

test("P11.265-288 accepts returned detainee only with active Rudenim-stay QR", () => {
  assert.equal(evaluateOperationalConsistency({
    contractId: "OPS-003", target: "SYNTHETIC", observations: [
      { checkpoint: "P11.273", detaineeId: "SYN-D-003", placement: "RETURNED", headcount: 10, qrContext: "RUDENIM_STAY", qrValidity: "ACTIVE" },
    ],
  }), "READY");
  assert.equal(evaluateOperationalConsistency({
    contractId: "OPS-004", target: "SYNTHETIC", observations: [
      { checkpoint: "P11.281", detaineeId: "SYN-D-004", placement: "RETURNED", headcount: 10, qrContext: "RUDENIM_STAY", qrValidity: "EXPIRED" },
    ],
  }), "BLOCKED");
});

test("P11.225-288 remains synthetic-only", () => {
  assert.equal(evaluateOperationalConsistency({ contractId: "OPS-005", target: "NON_PRODUCTION" as never, observations: [] }), "BLOCKED");
});
