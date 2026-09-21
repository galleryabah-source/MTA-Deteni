/**
 * P10.4 Leave Domain Contract
 *
 * Contract only. No persistence, migration, production mutation, or real-data fixture.
 */

export const LEAVE_DOMAIN_CONTRACT_VERSION = "P10.4-v1";

export type LeaveStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "REVIEWED"
  | "APPROVED"
  | "DEPARTED"
  | "RETURNED"
  | "RECEIVED"
  | "COMPLETED"
  | "REJECTED"
  | "CANCELLED";

export type LeaveRecord = {
  leaveId: string;
  detaineeId: string;
  purpose: string;
  status: LeaveStatus;
  requestedAt: string;
  verified: boolean;
};

export type LeaveCommand =
  | { type: "CREATE"; record: LeaveRecord }
  | { type: "SUBMIT"; leaveId: string }
  | { type: "REVIEW"; leaveId: string }
  | { type: "APPROVE"; leaveId: string }
  | { type: "DEPART"; leaveId: string }
  | { type: "RETURN"; leaveId: string }
  | { type: "RECEIVE"; leaveId: string }
  | { type: "COMPLETE"; leaveId: string }
  | { type: "REJECT"; leaveId: string; reason: string }
  | { type: "CANCEL"; leaveId: string; reason: string };

const ID = /^[A-Za-z0-9._-]{1,128}$/;

export function validateLeave(record: LeaveRecord): string[] {
  const errors: string[] = [];
  if (!ID.test(record.leaveId)) errors.push("INVALID_LEAVE_ID");
  if (!ID.test(record.detaineeId)) errors.push("INVALID_DETAINEE_ID");
  if (!record.purpose.trim()) errors.push("MISSING_PURPOSE");
  if (Number.isNaN(Date.parse(record.requestedAt))) errors.push("INVALID_REQUESTED_AT");
  if (!["DRAFT","SUBMITTED","REVIEWED","APPROVED","DEPARTED","RETURNED","RECEIVED","COMPLETED","REJECTED","CANCELLED"].includes(record.status)) {
    errors.push("INVALID_STATUS");
  }
  if (typeof record.verified !== "boolean") errors.push("INVALID_VERIFICATION_STATE");
  return errors;
}

export function validateLeaveCommand(command: LeaveCommand): string[] {
  if (command.type === "CREATE") return validateLeave(command.record);
  const errors: string[] = [];
  if (!ID.test(command.leaveId)) errors.push("INVALID_LEAVE_ID");
  if ((command.type === "REJECT" || command.type === "CANCEL") && !command.reason.trim()) {
    errors.push("MISSING_REASON");
  }
  return errors;
}
