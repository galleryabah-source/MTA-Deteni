export const DATABASE_CONTRACT_INVENTORY_VERSION = "P9.16-v1";

export type DatabaseObjectKind = "TABLE" | "INDEX" | "FUNCTION" | "POLICY" | "BUCKET";

export interface DatabaseContractObject {
  schema: string;
  name: string;
  kind: DatabaseObjectKind;
  ownerContract: string;
  required: boolean;
  sensitive: boolean;
}

export interface DatabaseContractInventory {
  environment: "DEVELOPMENT" | "TEST" | "STAGING" | "PRODUCTION";
  contractVersion: string;
  objects: DatabaseContractObject[];
}

export function validateDatabaseContractInventory(
  inventory: DatabaseContractInventory,
): boolean {
  if (!inventory.contractVersion || inventory.objects.length === 0) return false;
  return inventory.objects.every((object) =>
    Boolean(object.schema) &&
    Boolean(object.name) &&
    Boolean(object.kind) &&
    Boolean(object.ownerContract)
  );
}

export function hasDuplicateObjects(
  objects: DatabaseContractObject[],
): boolean {
  const keys = objects.map((object) =>
    [object.schema, object.name, object.kind].join(":")
  );
  return new Set(keys).size !== keys.length;
}
