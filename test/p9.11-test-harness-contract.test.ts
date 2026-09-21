import assert from "node:assert/strict";
import test from "node:test";
import {
  TEST_HARNESS_CONTRACT_VERSION,
  summarizeEvidence,
  validateTestCase,
  validateTestEvidence,
} from "../src/infrastructure/testing/kernel-test-harness";

test("P9.11 exposes a versioned test harness contract", () => {
  assert.equal(TEST_HARNESS_CONTRACT_VERSION, "P9.11-v1");
});

test("valid test case passes validation", () => {
  assert.doesNotThrow(() =>
    validateTestCase({
      id: "AUTH-001",
      name: "authorization denial",
      class: "AUTHORIZATION",
      expected: "DENY",
    }),
  );
});

test("test case identity is mandatory", () => {
  assert.throws(
    () =>
      validateTestCase({
        id: "",
        name: "missing id",
        class: "UNIT",
        expected: "PASS",
      }),
    /TEST_ID_REQUIRED/,
  );
});

test("test evidence must be deterministic", () => {
  assert.throws(
    () =>
      validateTestEvidence({
        testId: "AUTH-001",
        result: "PASS",
        deterministic: false,
      }),
    /TEST_EVIDENCE_MUST_BE_DETERMINISTIC/,
  );
});

test("failed evidence makes the aggregate fail", () => {
  assert.equal(
    summarizeEvidence([
      { testId: "A", result: "PASS", deterministic: true },
      { testId: "B", result: "FAIL", deterministic: true },
    ]),
    "FAIL",
  );
});

test("all passing evidence produces PASS", () => {
  assert.equal(
    summarizeEvidence([
      { testId: "A", result: "PASS", deterministic: true },
      { testId: "B", result: "PASS", deterministic: true },
    ]),
    "PASS",
  );
});
