export const INTEGRATED_EXIT_ORCHESTRATION_VERSION = "P10.17-v1";

export type ExitStage = "REQUEST" | "VALIDATE" | "AUTHORIZE" | "DOCUMENT" | "ESCORT" | "DEPART" | "RETURN" | "COMPLETE";
export type OrchestrationDecision = "ALLOWED" | "AUTH_REQUIRED" | "PERMISSION_DENIED" | "DUTY_REQUIRED" | "SCOPE_DENIED" | "INVALID_STATE";

export interface ExitOrchestrationContext {
  requestId: string;
  userId: string;
  authenticated: boolean;
  permission: string;
  dutyActive: boolean;
  scopeAllowed: boolean;
}

export interface ExitOrchestrationState {
  leaveStatus: "DRAFT" | "SUBMITTED" | "REVIEWED" | "APPROVED" | "DEPARTED" | "RETURNED" | "RECEIVED" | "COMPLETED" | "REJECTED" | "CANCELLED";
  documentStatus: "NONE" | "DRAFT" | "GENERATED" | "ISSUED" | "VOID";
  escortStatus: "NONE" | "PLANNED" | "ASSIGNED" | "COMPLETED" | "CANCELLED";
  stage: ExitStage;
}

export interface ExitOrchestrationDecision {
  decision: OrchestrationDecision;
  nextStage?: ExitStage;
  version: string;
}

const permissionByStage: Record<ExitStage, string> = {
  REQUEST: "leave.create", VALIDATE: "leave.submit", AUTHORIZE: "leave.approve",
  DOCUMENT: "document.generate", ESCORT: "escort.assign", DEPART: "leave.depart",
  RETURN: "leave.return", COMPLETE: "leave.complete",
};

export function evaluateExitOrchestration(context: ExitOrchestrationContext, state: ExitOrchestrationState): ExitOrchestrationDecision {
  if (!context.requestId || !context.userId || !context.authenticated)
    return { decision: "AUTH_REQUIRED", version: INTEGRATED_EXIT_ORCHESTRATION_VERSION };
  if (context.permission !== permissionByStage[state.stage])
    return { decision: "PERMISSION_DENIED", version: INTEGRATED_EXIT_ORCHESTRATION_VERSION };
  if (!context.dutyActive)
    return { decision: "DUTY_REQUIRED", version: INTEGRATED_EXIT_ORCHESTRATION_VERSION };
  if (!context.scopeAllowed)
    return { decision: "SCOPE_DENIED", version: INTEGRATED_EXIT_ORCHESTRATION_VERSION };

  const valid =
    (state.stage === "REQUEST" && state.leaveStatus === "DRAFT") ||
    (state.stage === "VALIDATE" && state.leaveStatus === "SUBMITTED") ||
    (state.stage === "AUTHORIZE" && state.leaveStatus === "REVIEWED") ||
    (state.stage === "DOCUMENT" && state.leaveStatus === "APPROVED" && state.documentStatus !== "ISSUED") ||
    (state.stage === "ESCORT" && state.leaveStatus === "APPROVED" && ["GENERATED","ISSUED"].includes(state.documentStatus) && ["NONE","PLANNED"].includes(state.escortStatus)) ||
    (state.stage === "DEPART" && state.leaveStatus === "APPROVED" && state.documentStatus === "ISSUED" && state.escortStatus === "ASSIGNED") ||
    (state.stage === "RETURN" && state.leaveStatus === "DEPARTED") ||
    (state.stage === "COMPLETE" && state.leaveStatus === "RECEIVED");

  if (!valid) return { decision: "INVALID_STATE", version: INTEGRATED_EXIT_ORCHESTRATION_VERSION };

  const nextStage: Record<ExitStage, ExitStage> = {
    REQUEST:"VALIDATE", VALIDATE:"AUTHORIZE", AUTHORIZE:"DOCUMENT", DOCUMENT:"ESCORT",
    ESCORT:"DEPART", DEPART:"RETURN", RETURN:"COMPLETE", COMPLETE:"COMPLETE",
  };
  return { decision:"ALLOWED", nextStage:nextStage[state.stage], version:INTEGRATED_EXIT_ORCHESTRATION_VERSION };
}
