export const REHEARSAL_VERIFICATION_MATRIX_VERSION = "P10.237-244-v1";

const REQUIRED_CASES = [
  "GOLDEN_PATH",
  "FAIL_BEFORE_COMMIT",
  "FAIL_AT_DEPART",
  "FAIL_AT_RETURN",
  "FAIL_AT_COMPLETE",
  "REPLAY",
  "PRODUCTION_BOUNDARY",
  "EXTERNAL_TRANSPORT_BOUNDARY",
];

export function evaluateRehearsalVerificationMatrix(results) {
  if (!Array.isArray(results) || results.length !== REQUIRED_CASES.length) {
    return { status: "BLOCKED", reason: "MATRIX_CASE_COUNT_INVALID", version: REHEARSAL_VERIFICATION_MATRIX_VERSION };
  }

  for (const [index, expectedCase] of REQUIRED_CASES.entries()) {
    const result = results[index];
    if (!result || result.caseId !== expectedCase) {
      return { status: "BLOCKED", reason: `MATRIX_CASE_INVALID:${index}`, version: REHEARSAL_VERIFICATION_MATRIX_VERSION };
    }
    if (result.pass !== true) {
      return { status: "FAIL", reason: `MATRIX_CASE_FAILED:${expectedCase}`, version: REHEARSAL_VERIFICATION_MATRIX_VERSION };
    }
  }

  return {
    status: "PASS",
    version: REHEARSAL_VERIFICATION_MATRIX_VERSION,
    productionMutation: false,
    externalTransport: false,
  };
}

export { REQUIRED_CASES };
