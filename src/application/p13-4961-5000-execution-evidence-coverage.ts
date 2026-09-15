import type { ControlledExecutionPlan } from "./p13-4921-4960-controlled-execution-plan";
import { assertControlledExecutionPlan } from "./p13-4921-4960-controlled-execution-plan";

export type EvidenceCoverage = Readonly<{
  planId: string;
  expectedControlIds: readonly string[];
  observedControlIds: readonly string[];
}>;

export function assertEvidenceCoverage(plan: ControlledExecutionPlan, coverage: EvidenceCoverage): void {
  assertControlledExecutionPlan(plan);
  if (coverage.planId !== plan.planId) throw new Error("EVIDENCE_COVERAGE_PLAN_MISMATCH");
  if (coverage.expectedControlIds.length === 0) throw new Error("EVIDENCE_COVERAGE_EXPECTATIONS_REQUIRED");
  const observed = new Set(coverage.observedControlIds);
  for (const controlId of coverage.expectedControlIds) {
    if (!observed.has(controlId)) throw new Error(`EVIDENCE_COVERAGE_MISSING:${controlId}`);
  }
}

export function assertNoUnexpectedObservedControls(plan: ControlledExecutionPlan, coverage: EvidenceCoverage): void {
  assertControlledExecutionPlan(plan);
  const expected = new Set(plan.items.map((item) => item.controlId));
  for (const controlId of coverage.observedControlIds) {
    if (!expected.has(controlId)) throw new Error(`EVIDENCE_COVERAGE_UNEXPECTED:${controlId}`);
  }
}
