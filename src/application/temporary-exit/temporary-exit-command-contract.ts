export const TEMPORARY_EXIT_COMMAND_CONTRACT_VERSION = "P10.26-v1";

export type TemporaryExitStage =
  | "REQUEST"
  | "VALIDATE"
  | "AUTHORIZE"
  | "DOCUMENT"
  | "ESCORT"
  | "DEPART"
  | "RETURN"
  | "COMPLETE";

export interface TemporaryExitCommand {
  requestId: string;
  correlationId: string;
  actorId: string;
  leaveId: string;
  stage: TemporaryExitStage;
  permission: string;
  policyVersion: string;
}

export interface TemporaryExitState {
  leaveStatus: string;
  documentStatus: string;
  escortStatus: string;
}

export type TemporaryExitDecision =
  | "ALLOWED"
  | "AUTH_REQUIRED"
  | "PERMISSION_DENIED"
  | "DUTY_REQUIRED"
  | "SCOPE_DENIED"
  | "INVALID_STATE"
  | "POLICY_DENIED";

const expectedPermission: Record<TemporaryExitStage,string> = {
  REQUEST:"leave.create",
  VALIDATE:"leave.submit",
  AUTHORIZE:"leave.approve",
  DOCUMENT:"document.generate",
  ESCORT:"escort.assign",
  DEPART:"leave.depart",
  RETURN:"leave.return",
  COMPLETE:"leave.complete",
};

export function validateTemporaryExitCommand(
  command: TemporaryExitCommand,
  context: { authenticated:boolean; dutyActive:boolean; scopeAllowed:boolean; policyAllowed:boolean },
  state: TemporaryExitState,
): TemporaryExitDecision {
  if (!context.authenticated) return "AUTH_REQUIRED";
  if (command.permission !== expectedPermission[command.stage]) return "PERMISSION_DENIED";
  if (!context.dutyActive) return "DUTY_REQUIRED";
  if (!context.scopeAllowed) return "SCOPE_DENIED";
  if (!context.policyAllowed) return "POLICY_DENIED";

  if (command.stage === "DEPART" &&
      !(state.leaveStatus === "APPROVED" &&
        state.documentStatus === "ISSUED" &&
        state.escortStatus === "ASSIGNED")) return "INVALID_STATE";

  if (command.stage === "RETURN" && state.leaveStatus !== "DEPARTED")
    return "INVALID_STATE";

  if (command.stage === "COMPLETE" && state.leaveStatus !== "RECEIVED")
    return "INVALID_STATE";

  return "ALLOWED";
}
