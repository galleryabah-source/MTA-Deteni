/**
 * P10.1 Detainee Domain Contract
 *
 * Contract only. No persistence, migration, production mutation, or real-data fixture.
 */

export const DETAINEE_DOMAIN_CONTRACT_VERSION = "P10.1-v1";

export type DetaineeStatus =
  | "ACTIVE"
  | "INACTIVE"
  | "TRANSFERRED"
  | "RELEASED"
  | "DECEASED";

export type DetaineeClassification =
  | "RESTRICTED"
  | "CONFIDENTIAL"
  | "INTERNAL";

export type DetaineeRecord = {
  detaineeId: string;
  registrationNumber: string;
  status: DetaineeStatus;
  classification: DetaineeClassification;
  verified: boolean;
};

export type DetaineeCommand =
  | { type: "CREATE"; record: DetaineeRecord }
  | { type: "UPDATE"; detaineeId: string; changes: Partial<Omit<DetaineeRecord, "detaineeId">> };

const ID = /^[A-Za-z0-9._-]{1,128}$/;

export function validateDetainee(record: DetaineeRecord): string[] {
  const errors: string[] = [];
  if (!ID.test(record.detaineeId)) errors.push("INVALID_DETAINEE_ID");
  if (!ID.test(record.registrationNumber)) errors.push("INVALID_REGISTRATION_NUMBER");
  if (!["ACTIVE","INACTIVE","TRANSFERRED","RELEASED","DECEASED"].includes(record.status)) {
    errors.push("INVALID_STATUS");
  }
  if (!["RESTRICTED","CONFIDENTIAL","INTERNAL"].includes(record.classification)) {
    errors.push("INVALID_CLASSIFICATION");
  }
  if (typeof record.verified !== "boolean") errors.push("INVALID_VERIFICATION_STATE");
  return errors;
}

export function validateDetaineeCommand(command: DetaineeCommand): string[] {
  if (command.type === "CREATE") return validateDetainee(command.record);
  const errors: string[] = [];
  if (!ID.test(command.detaineeId)) errors.push("INVALID_DETAINEE_ID");
  if (!command.changes || Object.keys(command.changes).length === 0) {
    errors.push("EMPTY_UPDATE");
  }
  return errors;
}
