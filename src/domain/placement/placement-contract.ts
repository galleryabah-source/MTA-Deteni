/**
 * P10.2 Placement Domain Contract
 *
 * Contract only. No persistence, migration, production mutation, or real-data fixture.
 */

export const PLACEMENT_DOMAIN_CONTRACT_VERSION = "P10.2-v1";

export type PlacementStatus = "CURRENT" | "ENDED";

export type PlacementRecord = {
  placementId: string;
  detaineeId: string;
  blockId: string;
  roomId: string;
  bedId: string;
  status: PlacementStatus;
  verified: boolean;
};

export type PlacementCommand =
  | { type: "ASSIGN"; record: PlacementRecord }
  | { type: "TRANSFER"; placementId: string; target: Pick<PlacementRecord, "blockId" | "roomId" | "bedId"> };

const ID = /^[A-Za-z0-9._-]{1,128}$/;

export function validatePlacement(record: PlacementRecord): string[] {
  const errors: string[] = [];
  for (const [name, value] of [
    ["placementId", record.placementId],
    ["detaineeId", record.detaineeId],
    ["blockId", record.blockId],
    ["roomId", record.roomId],
    ["bedId", record.bedId],
  ] as const) {
    if (!ID.test(value)) errors.push(`INVALID_${name.replace(/[A-Z]/g, (m) => `_${m}`).toUpperCase()}`);
  }
  if (!["CURRENT", "ENDED"].includes(record.status)) errors.push("INVALID_STATUS");
  if (typeof record.verified !== "boolean") errors.push("INVALID_VERIFICATION_STATE");
  return errors;
}

export function validatePlacementCommand(command: PlacementCommand): string[] {
  if (command.type === "ASSIGN") return validatePlacement(command.record);
  const errors: string[] = [];
  if (!ID.test(command.placementId)) errors.push("INVALID_PLACEMENT_ID");
  if (!ID.test(command.target.blockId)) errors.push("INVALID_BLOCK_ID");
  if (!ID.test(command.target.roomId)) errors.push("INVALID_ROOM_ID");
  if (!ID.test(command.target.bedId)) errors.push("INVALID_BED_ID");
  return errors;
}
