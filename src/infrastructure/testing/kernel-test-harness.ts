export const TEST_HARNESS_CONTRACT_VERSION = "P9.11-v1";

export type TestClass =
  | "UNIT"
  | "CONTRACT"
  | "INTEGRATION"
  | "AUTHORIZATION"
  | "SECURITY";

export interface TestCaseDefinition {
  id: string;
  name: string;
  class: TestClass;
  expected: "PASS" | "DENY" | "CONFLICT" | "FAIL";
}

export interface TestEvidence {
  testId: string;
  result: "PASS" | "FAIL";
  deterministic: boolean;
}

export function validateTestCase(testCase: TestCaseDefinition): void {
  if (!testCase.id.trim()) throw new Error("TEST_ID_REQUIRED");
  if (!testCase.name.trim()) throw new Error("TEST_NAME_REQUIRED");
}

export function validateTestEvidence(evidence: TestEvidence): void {
  if (!evidence.testId.trim()) throw new Error("TEST_EVIDENCE_ID_REQUIRED");
  if (!evidence.deterministic) {
    throw new Error("TEST_EVIDENCE_MUST_BE_DETERMINISTIC");
  }
}

export function summarizeEvidence(
  evidence: readonly TestEvidence[],
): "PASS" | "FAIL" {
  return evidence.some((item) => item.result === "FAIL") ? "FAIL" : "PASS";
}
