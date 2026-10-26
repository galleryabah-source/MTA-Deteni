import assert from "node:assert/strict";
import test from "node:test";
import { validatePlacement, validatePlacementCommand } from "../src/domain/placement/placement-contract.js";

const synthetic = {
  placementId: "PLC-001",
  detaineeId: "SYN-001",
  blockId: "B-01",
  roomId: "R-01",
  bedId: "BED-01",
  status: "CURRENT",
  verified: false,
};

test("P10.2 accepts a structurally valid synthetic placement", () => {
  assert.deepEqual(validatePlacement(synthetic), []);
});

test("P10.2 rejects invalid placement identity/location", () => {
  assert.deepEqual(validatePlacement({
    ...synthetic,
    placementId: "",
    detaineeId: "",
    blockId: "",
    roomId: "",
    bedId: "",
    status: "UNKNOWN",
    verified: "yes",
  }), [
    "INVALID_PLACEMENT_ID",
    "INVALID_DETAINEE_ID",
    "INVALID_BLOCK_ID",
    "INVALID_ROOM_ID",
    "INVALID_BED_ID",
    "INVALID_STATUS",
    "INVALID_VERIFICATION_STATE",
  ]);
});

test("P10.2 validates a transfer target without mutating state", () => {
  assert.deepEqual(validatePlacementCommand({
    type: "TRANSFER",
    placementId: "PLC-001",
    target: { blockId: "B-02", roomId: "R-02", bedId: "BED-03" },
  }), []);
});
