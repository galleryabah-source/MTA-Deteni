export const PRIVATE_STORAGE_CONTRACT_VERSION = "P9.9-v1";

export type StorageClassification = "RESTRICTED" | "CONFIDENTIAL" | "INTERNAL";

export interface PrivateStorageObject {
  objectId: string;
  bucket: string;
  objectPath: string;
  classification: StorageClassification;
  contentHash: string;
  contentType: string;
  sizeBytes: number;
}

export interface StorageAccessDecision {
  allowed: boolean;
  reasonCode:
    | "AUTHORIZED"
    | "AUTH_REQUIRED"
    | "SCOPE_DENIED"
    | "CLASSIFICATION_DENIED";
}

export function validatePrivateStorageObject(
  object: PrivateStorageObject,
): void {
  const required = [
    ["objectId", object.objectId],
    ["bucket", object.bucket],
    ["objectPath", object.objectPath],
    ["contentHash", object.contentHash],
    ["contentType", object.contentType],
  ] as const;

  for (const [name, value] of required) {
    if (typeof value !== "string" || !value.trim()) {
      throw new Error("STORAGE_" + name.toUpperCase() + "_REQUIRED");
    }
  }

  if (!Number.isInteger(object.sizeBytes) || object.sizeBytes < 0) {
    throw new Error("STORAGE_SIZE_INVALID");
  }
}

export function decidePrivateStorageAccess(input: {
  authenticated: boolean;
  scopeAllowed: boolean;
  classificationAllowed: boolean;
}): StorageAccessDecision {
  if (!input.authenticated) {
    return { allowed: false, reasonCode: "AUTH_REQUIRED" };
  }

  if (!input.scopeAllowed) {
    return { allowed: false, reasonCode: "SCOPE_DENIED" };
  }

  if (!input.classificationAllowed) {
    return { allowed: false, reasonCode: "CLASSIFICATION_DENIED" };
  }

  return { allowed: true, reasonCode: "AUTHORIZED" };
}
