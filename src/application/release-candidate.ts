export type ReleaseCheckStatus = "PASS" | "FAIL" | "NOT_RUN";
export type ReleaseTarget = "SYNTHETIC" | "NON_PRODUCTION";

export type ReleaseCheck = Readonly<{
  id: string;
  checkpoint: string;
  control: string;
  status: ReleaseCheckStatus;
  target: ReleaseTarget;
  evidenceRef: string;
}>;

export type ReleaseCandidateMatrix = Readonly<{
  matrixId: string;
  target: ReleaseTarget;
  checks: readonly ReleaseCheck[];
}>;

export type BoundaryAudit = Readonly<{
  target: ReleaseTarget;
  migrationFreeze: true;
  aiEnabled: false;
  productionAccess: false;
  directOperationalMutation: false;
  realPiiPresent: false;
  findings: readonly string[];
}>;

function isNonBlank(value: string): boolean {
  return value.trim().length > 0;
}

export function evaluateReleaseCandidate(matrix: ReleaseCandidateMatrix): "READY" | "BLOCKED" {
  if (!isNonBlank(matrix.matrixId) || matrix.checks.length === 0) return "BLOCKED";
  if (matrix.target === "NON_PRODUCTION" && matrix.checks.some((check) => check.target !== "NON_PRODUCTION")) return "BLOCKED";
  return matrix.checks.every((check) =>
    isNonBlank(check.id) &&
    isNonBlank(check.checkpoint) &&
    isNonBlank(check.control) &&
    check.status === "PASS" &&
    isNonBlank(check.evidenceRef),
  ) ? "READY" : "BLOCKED";
}

export function evaluateBoundaryAudit(audit: BoundaryAudit): "PASS" | "BLOCKED" {
  if (audit.migrationFreeze !== true) return "BLOCKED";
  if (audit.aiEnabled !== false || audit.productionAccess !== false) return "BLOCKED";
  if (audit.directOperationalMutation !== false || audit.realPiiPresent !== false) return "BLOCKED";
  return audit.findings.every((finding) => isNonBlank(finding)) && audit.findings.length === 0 ? "PASS" : "BLOCKED";
}

export function createSyntheticReleaseCheck(
  checkpoint: string,
  control: string,
  status: ReleaseCheckStatus = "PASS",
): ReleaseCheck {
  const id = `RC-${checkpoint.replace(/[^A-Z0-9]+/gi, "-")}-${control.replace(/[^A-Z0-9]+/gi, "-")}`;
  return {
    id,
    checkpoint,
    control,
    status,
    target: "SYNTHETIC",
    evidenceRef: `synthetic://${checkpoint}/${control}`,
  };
}
