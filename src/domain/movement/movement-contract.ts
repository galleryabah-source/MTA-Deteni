/**
 * P10.3 Movement Domain Contract
 *
 * Contract only. No persistence, migration, production mutation, or real-data fixture.
 */

export const MOVEMENT_DOMAIN_CONTRACT_VERSION = "P10.3-v1";

export type MovementType = "TRANSFER" | "ENTRY" | "EXIT" | "RETURN";
export type MovementStatus = "RECORDED" | "CANCELLED";

export type MovementRecord = {
  movementId: string;
  detaineeId: string;
  type: MovementType;
  fromPlacementId?: string;
  toPlacementId?: string;
  occurredAt: string;
  status: MovementStatus;
  verified: boolean;
};

export type MovementCommand =
  | { type: "RECORD"; record: MovementRecord }
  | { type: "CANCEL"; movementId: string; reason: string };

const ID = /^[A-Za-z0-9._-]{1,128}$/;

export function validateMovement(record: MovementRecord): string[] {
  const errors: string[] = [];
  if (!ID.test(record.movementId)) errors.push("INVALID_MOVEMENT_ID");
  if (!ID.test(record.detaineeId)) errors.push("INVALID_DETAINEE_ID");
  if (!["TRANSFER", "ENTRY", "EXIT", "RETURN"].includes(record.type)) errors.push("INVALID_MOVEMENT_TYPE");
  if (record.fromPlacementId !== undefined && !ID.test(record.fromPlacementId)) errors.push("INVALID_FROM_PLACEMENT_ID");
  if (record.toPlacementId !== undefined && !ID.test(record.toPlacementId)) errors.push("INVALID_TO_PLACEMENT_ID");
  if (Number.isNaN(Date.parse(record.occurredAt))) errors.push("INVALID_OCCURRED_AT");
  if (!["RECORDED", "CANCELLED"].includes(record.status)) errors.push("INVALID_STATUS");
  if (typeof record.verified !== "boolean") errors.push("INVALID_VERIFICATION_STATE");
  return errors;
}

export function validateMovementCommand(command: MovementCommand): string[] {
  if (command.type === "RECORD") return validateMovement(command.record);
  const errors: string[] = [];
  if (!ID.test(command.movementId)) errors.push("INVALID_MOVEMENT_ID");
  if (!command.reason.trim()) errors.push("MISSING_CANCELLATION_REASON");
  return errors;
}
