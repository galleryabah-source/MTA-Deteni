import assert from "node:assert/strict";
import test from "node:test";
import { validateDetainee, validateDetaineeCommand } from "../src/domain/detainee/detainee-contract.js";

const synthetic = {
  detaineeId: "SYN-001",
  registrationNumber: "REG-001",
  status: "ACTIVE",
  classification: "RESTRICTED",
  verified: false,
};

test("P10.1 accepts a structurally valid synthetic detainee record", () => {
  assert.deepEqual(validateDetainee(synthetic), []);
});

test("P10.1 rejects invalid identity and state fields", () => {
  assert.deepEqual(validateDetainee({
    ...synthetic,
    detaineeId: "",
    registrationNumber: "",
    status: "UNKNOWN",
    classification: "PUBLIC",
    verified: "yes",
  }), [
    "INVALID_DETAINEE_ID",
    "INVALID_REGISTRATION_NUMBER",
    "INVALID_STATUS",
    "INVALID_CLASSIFICATION",
    "INVALID_VERIFICATION_STATE",
  ]);
});

test("P10.1 rejects an empty update command", () => {
  assert.deepEqual(validateDetaineeCommand({
    type: "UPDATE",
    detaineeId: "SYN-001",
    changes: {},
  }), ["EMPTY_UPDATE"]);
});
