export type ExecutionStage = "TEST_SUITE" | "RUNTIME" | "BROWSER" | "LAN" | "REPORT" | "RECOVERY" | "SECURITY";

export type ExecutionPlanItem = Readonly<{
  stage: ExecutionStage;
  controlId: string;
  requiredObservation: string;
  evidenceId: string;
  status: "PENDING" | "PASS" | "FAIL" | "NOT_RUN";
}>;

export type ControlledExecutionPlan = Readonly<{
  planId: string;
  environment: "CONTROLLED_NONPROD";
  items: readonly ExecutionPlanItem[];
  syntheticOnly: true;
  productionAuthorized: false;
}>;

const ORDER: readonly ExecutionStage[] = ["TEST_SUITE", "RUNTIME", "BROWSER", "LAN", "REPORT", "RECOVERY", "SECURITY"];

export function assertControlledExecutionPlan(plan: ControlledExecutionPlan): void {
  if (!plan.planId.trim() || plan.items.length === 0) throw new Error("CONTROLLED_EXECUTION_PLAN_REQUIRED");
  if (plan.environment !== "CONTROLLED_NONPROD" || !plan.syntheticOnly || plan.productionAuthorized) throw new Error("CONTROLLED_EXECUTION_GOVERNANCE_BLOCKED");
  for (const item of plan.items) {
    if (!item.controlId.trim() || !item.requiredObservation.trim() || !item.evidenceId.trim()) throw new Error("CONTROLLED_EXECUTION_ITEM_IDENTITY_REQUIRED");
    if (!ORDER.includes(item.stage)) throw new Error("CONTROLLED_EXECUTION_STAGE_INVALID");
  }
}

export function assertExecutionPlanCertified(plan: ControlledExecutionPlan): void {
  assertControlledExecutionPlan(plan);
  for (const stage of ORDER) {
    const items = plan.items.filter((item) => item.stage === stage);
    if (items.length === 0) throw new Error(`CONTROLLED_EXECUTION_STAGE_MISSING:${stage}`);
    if (items.some((item) => item.status !== "PASS")) throw new Error(`CONTROLLED_EXECUTION_STAGE_NOT_CERTIFIED:${stage}`);
  }
}
