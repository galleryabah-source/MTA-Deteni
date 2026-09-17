export const REQUIRED_P1_RUNTIME_CONTROLS = Object.freeze([
  "P1-CTX-01",
  "P1-IDEM-02",
  "P1-TX-03",
  "P1-AUDIT-04",
  "P1-OUTBOX-05",
  "P1-OBS-06",
  "P1-FAIL-07",
] as const);

export type P1RuntimeControlId = (typeof REQUIRED_P1_RUNTIME_CONTROLS)[number];
export type P1RuntimeControlStatus = "PASS" | "FAIL" | "PENDING";

export type P1RuntimeControlEvidence = Readonly<{
  controlId: P1RuntimeControlId;
  status: P1RuntimeControlStatus;
  exitCode: number | null;
  evidenceRef?: string;
}>;

export type P1RuntimeCertificationEvidence = Readonly<{
  schemaVersion: "mta-p1-runtime-certification/v1";
  executionId: string;
  commit: string;
  environment: "controlled-nonprod";
  productionAccessAuthorized: false;
  migrationExecuted: false;
  aiEnabled: false;
  status: "OBSERVED_PASS" | "OBSERVATION_INCOMPLETE";
  controls: readonly P1RuntimeControlEvidence[];
}>;

function requiredText(value: string, code: string): string {
  const normalized = value.trim();
  if (!normalized) throw new Error(code);
  return normalized;
}

export function validateP1RuntimeCertificationEvidence(
  evidence: P1RuntimeCertificationEvidence,
): void {
  if (evidence.schemaVersion !== "mta-p1-runtime-certification/v1") {
    throw new Error("P1_CERTIFICATION_SCHEMA_INVALID");
  }
  requiredText(evidence.executionId, "P1_CERTIFICATION_EXECUTION_ID_REQUIRED");
  const commit = requiredText(evidence.commit, "P1_CERTIFICATION_COMMIT_REQUIRED");
  if (commit === "unknown") throw new Error("P1_CERTIFICATION_COMMIT_UNRESOLVED");
  if (evidence.environment !== "controlled-nonprod") throw new Error("P1_CERTIFICATION_ENVIRONMENT_INVALID");
  if (evidence.productionAccessAuthorized !== false) throw new Error("P1_CERTIFICATION_PRODUCTION_AUTHORIZATION_INVALID");
  if (evidence.migrationExecuted !== false) throw new Error("P1_CERTIFICATION_MIGRATION_STATE_INVALID");
  if (evidence.aiEnabled !== false) throw new Error("P1_CERTIFICATION_AI_STATE_INVALID");

  if (evidence.controls.length !== REQUIRED_P1_RUNTIME_CONTROLS.length) {
    throw new Error("P1_CERTIFICATION_CONTROL_COUNT_INVALID");
  }

  const expected = new Set<P1RuntimeControlId>(REQUIRED_P1_RUNTIME_CONTROLS);
  const seen = new Set<P1RuntimeControlId>();
  for (const control of evidence.controls) {
    if (!expected.has(control.controlId)) throw new Error("P1_CERTIFICATION_UNKNOWN_CONTROL");
    if (seen.has(control.controlId)) throw new Error("P1_CERTIFICATION_DUPLICATE_CONTROL");
    seen.add(control.controlId);
    if (!Number.isInteger(control.exitCode) && control.exitCode !== null) {
      throw new Error("P1_CERTIFICATION_EXIT_CODE_INVALID");
    }
    if (control.status === "PASS" && control.exitCode !== 0) {
      throw new Error("P1_CERTIFICATION_PASS_EXIT_CODE_INVALID");
    }
  }
  for (const id of REQUIRED_P1_RUNTIME_CONTROLS) {
    if (!seen.has(id)) throw new Error("P1_CERTIFICATION_REQUIRED_CONTROL_MISSING");
  }
}

/**
 * Certification is evidence validation only. It never authorizes production
 * access, migrations, AI activation, or external delivery.
 */
export function assertP1RuntimeObservedPass(
  evidence: P1RuntimeCertificationEvidence,
): void {
  validateP1RuntimeCertificationEvidence(evidence);
  if (evidence.status !== "OBSERVED_PASS") throw new Error("P1_CERTIFICATION_NOT_OBSERVED_PASS");
  for (const control of evidence.controls) {
    if (control.status !== "PASS" || control.exitCode !== 0) {
      throw new Error("P1_CERTIFICATION_CONTROL_NOT_PASS");
    }
  }
}
