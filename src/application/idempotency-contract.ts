export type IdempotencyRecord = Readonly<{
  idempotencyKey: string;
  commandType: string;
  requestHash: string;
  status: "IN_PROGRESS" | "COMPLETED" | "FAILED";
  responseFingerprint?: string;
  createdAt: string;
  completedAt?: string;
}>;

export function assertIdempotencyKey(key: string): void {
  if (!key.trim()) throw new Error("Idempotency key is required for critical mutations.");
}

export function createIdempotencyRecord(input: IdempotencyRecord): IdempotencyRecord {
  assertIdempotencyKey(input.idempotencyKey);
  if (!input.commandType.trim() || !input.requestHash.trim() || !input.createdAt.trim()) throw new Error("Idempotency record identity is incomplete.");
  return Object.freeze({ ...input });
}

export function assertIdempotencyReplaySafe(existing: IdempotencyRecord, requestHash: string): void {
  assertIdempotencyKey(existing.idempotencyKey);
  if (existing.requestHash !== requestHash) throw new Error("IDEMPOTENCY_KEY_REUSED_WITH_DIFFERENT_REQUEST: idempotency key reused with a different request.");
}

export function resolveIdempotency(existing: IdempotencyRecord | undefined, requestHash: string): "EXECUTE" | "REPLAY" | "CONFLICT" {
  if (!existing) return "EXECUTE";
  if (existing.requestHash !== requestHash) return "CONFLICT";
  return existing.status === "COMPLETED" ? "REPLAY" : "EXECUTE";
}
