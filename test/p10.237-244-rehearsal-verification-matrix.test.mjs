import test from "node:test";
import assert from "node:assert/strict";
import {
  evaluateRehearsalVerificationMatrix,
  REQUIRED_CASES,
} from "../src/application/testing/rehearsal-verification-matrix.mjs";

const passing = REQUIRED_CASES.map((caseId) => ({ caseId, pass: true }));

test("P10.237 complete verification matrix passes only with all cases", () => {
  const result = evaluateRehearsalVerificationMatrix(passing);
  assert.equal(result.status, "PASS");
  assert.equal(result.productionMutation, false);
});

test("P10.238 incomplete matrix is blocked", () => {
  assert.equal(evaluateRehearsalVerificationMatrix(passing.slice(0, 7)).reason, "MATRIX_CASE_COUNT_INVALID");
});

test("P10.239 case order is deterministic", () => {
  const results = [...passing];
  [results[0], results[1]] = [results[1], results[0]];
  assert.equal(evaluateRehearsalVerificationMatrix(results).status, "BLOCKED");
});

test("P10.240 golden path is mandatory", () => {
  const results = [...passing];
  results[0] = { caseId: "GOLDEN_PATH", pass: false };
  assert.equal(evaluateRehearsalVerificationMatrix(results).reason, "MATRIX_CASE_FAILED:GOLDEN_PATH");
});

test("P10.241 rollback failure case is mandatory", () => {
  const results = [...passing];
  results[1] = { caseId: "FAIL_BEFORE_COMMIT", pass: false };
  assert.equal(evaluateRehearsalVerificationMatrix(results).reason, "MATRIX_CASE_FAILED:FAIL_BEFORE_COMMIT");
});

test("P10.242 replay case is mandatory", () => {
  const results = [...passing];
  results[5] = { caseId: "REPLAY", pass: false };
  assert.equal(evaluateRehearsalVerificationMatrix(results).reason, "MATRIX_CASE_FAILED:REPLAY");
});

test("P10.243 production boundary remains disabled", () => {
  const result = evaluateRehearsalVerificationMatrix(passing);
  assert.equal(result.productionMutation, false);
  assert.equal(result.externalTransport, false);
});

test("P10.244 external transport boundary remains disabled", () => {
  const results = [...passing];
  results[7] = { caseId: "EXTERNAL_TRANSPORT_BOUNDARY", pass: false };
  assert.equal(evaluateRehearsalVerificationMatrix(results).status, "FAIL");
});
