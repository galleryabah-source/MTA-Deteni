export const OPERATOR_WORKFLOW_STATES = ["DRAFT", "VALIDATED", "PREVIEW", "REVIEW", "APPROVED", "GENERATED"] as const;
export type OperatorWorkflowState = (typeof OPERATOR_WORKFLOW_STATES)[number];

const TRANSITIONS: Readonly<Record<OperatorWorkflowState, readonly OperatorWorkflowState[]>> = {
  DRAFT: ["VALIDATED"],
  VALIDATED: ["PREVIEW"],
  PREVIEW: ["REVIEW"],
  REVIEW: ["APPROVED"],
  APPROVED: ["GENERATED"],
  GENERATED: [],
};

export function canAdvanceOperatorWorkflow(from: OperatorWorkflowState, to: OperatorWorkflowState): boolean {
  return TRANSITIONS[from].includes(to);
}

export function advanceOperatorWorkflow(from: OperatorWorkflowState, to: OperatorWorkflowState): OperatorWorkflowState {
  if (!canAdvanceOperatorWorkflow(from, to)) throw new Error("OPERATOR_WORKFLOW_TRANSITION_DENIED");
  return to;
}
