export type WorkflowDomain = "RAP" | "PERKES" | "KAMTIB" | "SUBBAG_TU" | "LEADERSHIP";

export type WorkflowStep = Readonly<{
  checkpoint: string;
  domain: WorkflowDomain;
  action: string;
  nextOwner: WorkflowDomain;
  readOnly: boolean;
}>;

export type WorkflowContract = Readonly<{
  contractId: string;
  target: "SYNTHETIC";
  steps: readonly WorkflowStep[];
}>;

const ORDER: readonly WorkflowDomain[] = ["RAP", "KAMTIB", "LEADERSHIP", "SUBBAG_TU", "KAMTIB"];

export function defaultTemporaryExitWorkflow(): readonly WorkflowStep[] {
  return [
    { checkpoint: "P11.129-136", domain: "RAP", action: "REQUEST", nextOwner: "KAMTIB", readOnly: false },
    { checkpoint: "P11.137-144", domain: "KAMTIB", action: "VALIDATE", nextOwner: "LEADERSHIP", readOnly: false },
    { checkpoint: "P11.145-152", domain: "LEADERSHIP", action: "APPROVE", nextOwner: "SUBBAG_TU", readOnly: false },
    { checkpoint: "P11.153-160", domain: "SUBBAG_TU", action: "DOCUMENT", nextOwner: "KAMTIB", readOnly: false },
  ];
}

export function validateWorkflowContract(contract: WorkflowContract): "READY" | "BLOCKED" {
  if (!contract.contractId.trim() || contract.target !== "SYNTHETIC" || contract.steps.length !== ORDER.length - 1) return "BLOCKED";
  return contract.steps.every((step, index) =>
    step.domain === ORDER[index] &&
    step.nextOwner === ORDER[index + 1] &&
    step.action.trim().length > 0 &&
    step.checkpoint.trim().length > 0 &&
    step.readOnly === false,
  ) ? "READY" : "BLOCKED";
}
