export const REQUIRED_HARNESS_CONTROLS = Object.freeze([
  "BUILD-5801",
  "BUILD-5802",
  "BUILD-5803",
  "REG-5804",
  "REG-5805",
] as const);

export type HarnessCheck = Readonly<{
  controlId: string;
  status: "PASS" | "FAIL";
  exitCode: number;
}>;

export type HarnessEvidence = Readonly<{
  schemaVersion: string;
  executionId: string;
  commit: string;
  environment: "controlled-nonprod";
  status: "OBSERVED_PASS" | "OBSERVATION_INCOMPLETE";
  checks: readonly HarnessCheck[];
}>;

export function validateHarnessEvidence(evidence: HarnessEvidence): void {
  if (!evidence.schemaVersion.trim()) throw new Error("HARNESS_SCHEMA_REQUIRED");
  if (!evidence.executionId.trim()) throw new Error("HARNESS_EXECUTION_ID_REQUIRED");
  if (!evidence.commit.trim() || evidence.commit === "unknown") throw new Error("HARNESS_COMMIT_REQUIRED");
  if (evidence.environment !== "controlled-nonprod") throw new Error("HARNESS_ENVIRONMENT_INVALID");
  if (!Array.isArray(evidence.checks) || evidence.checks.length !== REQUIRED_HARNESS_CONTROLS.length) {
    throw new Error("HARNESS_CHECKS_REQUIRED");
  }

  const ids = new Set<string>();
  for (const check of evidence.checks) {
    if (!check.controlId.trim()) throw new Error("HARNESS_CONTROL_ID_REQUIRED");
    if (ids.has(check.controlId)) throw new Error("HARNESS_DUPLICATE_CONTROL_ID");
    ids.add(check.controlId);
    if (check.status !== "PASS" && check.status !== "FAIL") throw new Error("HARNESS_STATUS_INVALID");
    if (!Number.isInteger(check.exitCode)) throw new Error("HARNESS_EXIT_CODE_INVALID");
    if (check.status === "PASS" && check.exitCode !== 0) throw new Error("HARNESS_PASS_EXIT_CODE_MISMATCH");
  }

  for (const requiredId of REQUIRED_HARNESS_CONTROLS) {
    if (!ids.has(requiredId)) throw new Error(`HARNESS_REQUIRED_CONTROL_MISSING:${requiredId}`);
  }
}

export function assertHarnessObservedPass(evidence: HarnessEvidence): void {
  validateHarnessEvidence(evidence);
  if (evidence.status !== "OBSERVED_PASS") throw new Error("HARNESS_OBSERVATION_INCOMPLETE");
  if (evidence.checks.some((check) => check.status !== "PASS" || check.exitCode !== 0)) {
    throw new Error("HARNESS_CHECK_FAILURE");
  }
}
