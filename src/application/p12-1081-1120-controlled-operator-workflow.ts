import type { ActorContext } from "../domain/shared/contracts.js";

export type OperatorWorkflowStage = "DRAFT" | "VALIDATED" | "PREVIEW" | "REVIEW" | "APPROVED" | "GENERATED";

export type ControlledOperatorWorkflow = Readonly<{
  workflowId: string;
  actor: ActorContext;
  stage: OperatorWorkflowStage;
  aggregateId: string;
  detaineeId: string;
}>;

const NEXT: Readonly<Record<OperatorWorkflowStage, OperatorWorkflowStage[]>> = {
  DRAFT: ["VALIDATED"],
  VALIDATED: ["PREVIEW"],
  PREVIEW: ["REVIEW"],
  REVIEW: ["APPROVED"],
  APPROVED: ["GENERATED"],
  GENERATED: [],
};

export function advanceOperatorWorkflow(workflow: ControlledOperatorWorkflow, next: OperatorWorkflowStage): ControlledOperatorWorkflow {
  if (!workflow.workflowId.trim() || !workflow.aggregateId.trim() || !workflow.detaineeId.trim()) throw new Error("OPERATOR_WORKFLOW_IDENTITY_REQUIRED");
  if (!NEXT[workflow.stage].includes(next)) throw new Error("OPERATOR_WORKFLOW_TRANSITION_DENIED");
  return { ...workflow, stage: next };
}
