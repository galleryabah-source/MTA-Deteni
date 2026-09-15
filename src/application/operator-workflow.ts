export type OperatorWorkflowStep = Readonly<{
  id: string;
  domain: "RAP" | "PERKES" | "KAMTIB" | "SUBBAG_TU" | "LEADERSHIP";
  permission: string;
  readOnly: boolean;
}>;

export const CANONICAL_TEMPORARY_EXIT_OPERATOR_FLOW: readonly OperatorWorkflowStep[] = [
  { id: "request", domain: "RAP", permission: "temporary_exit.request", readOnly: false },
  { id: "validate", domain: "KAMTIB", permission: "temporary_exit.validate", readOnly: false },
  { id: "approve", domain: "LEADERSHIP", permission: "temporary_exit.approve", readOnly: false },
  { id: "document", domain: "SUBBAG_TU", permission: "temporary_exit.document", readOnly: false },
  { id: "assign-escort", domain: "KAMTIB", permission: "temporary_exit.escort.assign", readOnly: false },
  { id: "depart", domain: "KAMTIB", permission: "temporary_exit.depart", readOnly: false },
  { id: "return", domain: "KAMTIB", permission: "temporary_exit.return", readOnly: false },
  { id: "oversight", domain: "LEADERSHIP", permission: "timeline.read", readOnly: true },
];

export function hasDuplicateWorkflowStepIds(steps: readonly OperatorWorkflowStep[]): boolean {
  return new Set(steps.map((step) => step.id)).size !== steps.length;
}
