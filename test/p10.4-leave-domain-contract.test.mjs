import assert from "node:assert/strict";
import test from "node:test";
import { validateLeave, validateLeaveCommand } from "../src/domain/leave/leave-contract.js";

const synthetic = {
  leaveId: "LV-001",
  detaineeId: "SYN-001",
  purpose: "Synthetic operational test",
  status: "DRAFT",
  requestedAt: "2026-09-21T08:00:00.000Z",
  verified: false,
};

test("P10.4 accepts a structurally valid synthetic leave request", () => {
  assert.deepEqual(validateLeave(synthetic), []);
});

test("P10.4 rejects invalid leave identity, purpose, time, and verification", () => {
  assert.deepEqual(validateLeave({
    ...synthetic,
    leaveId: "",
    detaineeId: "",
    purpose: " ",
    requestedAt: "not-a-date",
    status: "UNKNOWN",
    verified: "yes",
  }), [
    "INVALID_LEAVE_ID",
    "INVALID_DETAINEE_ID",
    "MISSING_PURPOSE",
    "INVALID_REQUESTED_AT",
    "INVALID_STATUS",
    "INVALID_VERIFICATION_STATE",
  ]);
});

test("P10.4 requires reasons for rejection and cancellation", () => {
  assert.deepEqual(validateLeaveCommand({
    type: "REJECT",
    leaveId: "LV-001",
    reason: " ",
  }), ["MISSING_REASON"]);
  assert.deepEqual(validateLeaveCommand({
    type: "CANCEL",
    leaveId: "LV-001",
    reason: " ",
  }), ["MISSING_REASON"]);
});
