import assert from "node:assert/strict";
import test from "node:test";
import { validateMovement, validateMovementCommand } from "../src/domain/movement/movement-contract.js";

const synthetic = {
  movementId: "MOV-001",
  detaineeId: "SYN-001",
  type: "TRANSFER",
  fromPlacementId: "PLC-001",
  toPlacementId: "PLC-002",
  occurredAt: "2026-09-21T08:00:00.000Z",
  status: "RECORDED",
  verified: false,
};

test("P10.3 accepts a structurally valid synthetic movement", () => {
  assert.deepEqual(validateMovement(synthetic), []);
});

test("P10.3 rejects invalid movement fields", () => {
  assert.deepEqual(validateMovement({
    ...synthetic,
    movementId: "",
    detaineeId: "",
    type: "UNKNOWN",
    fromPlacementId: "",
    toPlacementId: "",
    occurredAt: "not-a-date",
    status: "UNKNOWN",
    verified: "yes",
  }), [
    "INVALID_MOVEMENT_ID",
    "INVALID_DETAINEE_ID",
    "INVALID_MOVEMENT_TYPE",
    "INVALID_FROM_PLACEMENT_ID",
    "INVALID_TO_PLACEMENT_ID",
    "INVALID_OCCURRED_AT",
    "INVALID_STATUS",
    "INVALID_VERIFICATION_STATE",
  ]);
});

test("P10.3 requires a reason for cancellation", () => {
  assert.deepEqual(validateMovementCommand({
    type: "CANCEL",
    movementId: "MOV-001",
    reason: " ",
  }), ["MISSING_CANCELLATION_REASON"]);
});
