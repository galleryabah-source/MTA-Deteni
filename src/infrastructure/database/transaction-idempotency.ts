export const TRANSACTION_IDEMPOTENCY_CONTRACT_VERSION = "P9.7-v1";

export interface TransactionContext {
  transactionId: string;
}

export interface IdempotencyRecord {
  key: string;
  requestHash: string;
  status: "IN_PROGRESS" | "COMPLETED";
  responseHash?: string;
}

export interface TransactionRunner {
  transaction<T>(
    operation: (context: TransactionContext) => Promise<T>,
  ): Promise<T>;
}

export interface IdempotencyStore {
  begin(record: IdempotencyRecord): Promise<"ACQUIRED" | "REPLAY" | "CONFLICT">;
  complete(key: string, responseHash: string): Promise<void>;
}

export function validateIdempotencyKey(key: unknown): void {
  if (typeof key !== "string" || !key.trim()) {
    throw new Error("IDEMPOTENCY_KEY_REQUIRED");
  }
}

export function validateRequestHash(hash: unknown): void {
  if (typeof hash !== "string" || !hash.trim()) {
    throw new Error("REQUEST_HASH_REQUIRED");
  }
}

export function validateIdempotencyReplay(
  existing: Pick<IdempotencyRecord, "requestHash">,
  requestHash: string,
): "REPLAY" | "CONFLICT" {
  validateRequestHash(requestHash);

  return existing.requestHash === requestHash ? "REPLAY" : "CONFLICT";
}
