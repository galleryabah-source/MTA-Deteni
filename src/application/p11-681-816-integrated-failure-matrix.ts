import { evaluateCrossDomainComposition, type CrossDomainComposition } from "./p11-545-608-cross-domain-composition.js";
import { evaluateReportConsistency, type ReportConsistencyInput } from "./p11-609-680-report-reconciliation.js";

export type FailureScenario = Readonly<{
  id: string;
  crossDomain: CrossDomainComposition;
  report: ReportConsistencyInput;
  expected: "READY" | "BLOCKED";
}>;

export type FailureMatrix = Readonly<{
  matrixId: string;
  target: "SYNTHETIC";
  scenarios: readonly FailureScenario[];
}>;

export function evaluateFailureMatrix(matrix: FailureMatrix): "READY" | "BLOCKED" {
  if (!matrix.matrixId.trim() || matrix.target !== "SYNTHETIC" || matrix.scenarios.length === 0) return "BLOCKED";
  return matrix.scenarios.every((scenario) => {
    if (!scenario.id.trim()) return false;
    const actual = evaluateCrossDomainComposition(scenario.crossDomain) === "READY" && evaluateReportConsistency(scenario.report) === "READY" ? "READY" : "BLOCKED";
    return actual === scenario.expected;
  }) ? "READY" : "BLOCKED";
}
