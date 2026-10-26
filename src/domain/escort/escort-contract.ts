/**
 * P10.5 Escort Domain Contract
 *
 * NOTE: P10.5 numbering is not explicitly present in the authoritative uploaded
 * source. The source does explicitly define escort.view/assign/complete and
 * D4 escort planning, while P10.1-P10.4 are the only numbered P10 modules
 * explicitly listed. This contract therefore marks P10.5 as an inferred
 * sequential continuation and must not be treated as source-confirmed numbering.
 *
 * Contract only. No persistence, migration, production mutation, or real-data fixture.
 */

export const ESCORT_DOMAIN_CONTRACT_VERSION = "P10.5-INFERRED-v1";

export type EscortStatus = "PLANNED" | "ASSIGNED" | "COMPLETED" | "CANCELLED";

export type EscortRecord = {
  escortId: string;
  leaveId: string;
  detaineeId: string;
  status: EscortStatus;
  assignedOfficerId?: string;
  plannedAt: string;
  verified: boolean;
};

export type EscortCommand =
  | { type: "PLAN"; record: EscortRecord }
  | { type: "ASSIGN"; escortId: string; officerId: string }
  | { type: "COMPLETE"; escortId: string }
  | { type: "CANCEL"; escortId: string; reason: string };

const ID = /^[A-Za-z0-9._-]{1,128}$/;

export function validateEscort(record: EscortRecord): string[] {
  const errors: string[] = [];
  if (!ID.test(record.escortId)) errors.push("INVALID_ESCORT_ID");
  if (!ID.test(record.leaveId)) errors.push("INVALID_LEAVE_ID");
  if (!ID.test(record.detaineeId)) errors.push("INVALID_DETAINEE_ID");
  if (!["PLANNED","ASSIGNED","COMPLETED","CANCELLED"].includes(record.status)) errors.push("INVALID_STATUS");
  if (record.assignedOfficerId !== undefined && !ID.test(record.assignedOfficerId)) errors.push("INVALID_ASSIGNED_OFFICER_ID");
  if (Number.isNaN(Date.parse(record.plannedAt))) errors.push("INVALID_PLANNED_AT");
  if (typeof record.verified !== "boolean") errors.push("INVALID_VERIFICATION_STATE");
  return errors;
}

export function validateEscortCommand(command: EscortCommand): string[] {
  if (command.type === "PLAN") return validateEscort(command.record);
  const errors: string[] = [];
  if (!ID.test(command.escortId)) errors.push("INVALID_ESCORT_ID");
  if (command.type === "ASSIGN" && !ID.test(command.officerId)) errors.push("INVALID_OFFICER_ID");
  if (command.type === "CANCEL" && !command.reason.trim()) errors.push("MISSING_REASON");
  return errors;
}
