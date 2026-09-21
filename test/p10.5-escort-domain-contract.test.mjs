import assert from "node:assert/strict";
import test from "node:test";
import { validateEscort, validateEscortCommand } from "../src/domain/escort/escort-contract.js";

const synthetic = {
  escortId: "ESC-001",
  leaveId: "LV-001",
  detaineeId: "SYN-001",
  status: "PLANNED",
  plannedAt: "2026-09-21T08:00:00.000Z",
  verified: false,
};

test("inferred P10.5 accepts a structurally valid synthetic escort plan", () => {
  assert.deepEqual(validateEscort(synthetic), []);
});

test("inferred P10.5 validates assignment officer identity", () => {
  assert.deepEqual(validateEscortCommand({
    type: "ASSIGN",
    escortId: "ESC-001",
    officerId: "OFF-001",
  }), []);
});

test("inferred P10.5 requires a cancellation reason", () => {
  assert.deepEqual(validateEscortCommand({
    type: "CANCEL",
    escortId: "ESC-001",
    reason: " ",
  }), ["MISSING_REASON"]);
});
