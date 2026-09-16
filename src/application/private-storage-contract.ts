export type StorageClassification = "PRIVATE" | "RESTRICTED";

export type PrivateStorageObject = Readonly<{
  objectId: string;
  storageKey: string;
  classification: StorageClassification;
  contentFingerprint: string;
  contentType: string;
  sizeBytes: number;
  createdAt: string;
}>;

export type PrivateStorageDisposition = "ADMIT" | "REPLAY" | "CONFLICT";

export type PrivateStorageContract = Readonly<{
  putPrivate: (object: PrivateStorageObject) => Promise<PrivateStorageDisposition>;
  getPrivate: (objectId: string) => Promise<PrivateStorageObject | null>;
}>;

export function validatePrivateStorageObject(object: PrivateStorageObject): void {
  const required = [object.objectId, object.storageKey, object.contentFingerprint, object.contentType, object.createdAt];
  if (required.some((value) => !value.trim())) throw new Error("PRIVATE_STORAGE_IDENTITY_REQUIRED");
  if (object.classification !== "PRIVATE" && object.classification !== "RESTRICTED") {
    throw new Error("PRIVATE_STORAGE_CLASSIFICATION_INVALID");
  }
  if (!Number.isSafeInteger(object.sizeBytes) || object.sizeBytes < 0) {
    throw new Error("PRIVATE_STORAGE_SIZE_INVALID");
  }
}

export function assertPrivateStorageReplaySafe(existing: PrivateStorageObject, candidate: PrivateStorageObject): void {
  if (existing.objectId !== candidate.objectId || existing.storageKey !== candidate.storageKey) {
    throw new Error("PRIVATE_STORAGE_IDENTITY_MISMATCH");
  }
  if (existing.contentFingerprint !== candidate.contentFingerprint) {
    throw new Error("PRIVATE_STORAGE_CONTENT_DRIFT");
  }
}

export function createPrivateStorageObject(input: PrivateStorageObject): PrivateStorageObject {
  validatePrivateStorageObject(input);
  return Object.freeze({ ...input });
}
