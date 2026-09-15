export type IdempotencyRecord = Readonly<{
  key: string;
  fingerprint: string;
  actorId: string;
  correlationId: string;
  aggregateId: string;
  state: "IN_PROGRESS" | "COMPLETED";
  result?: Readonly<Record<string, unknown>>;
}>;

export type PersistentIdempotencyPort = Readonly<{
  acquire(key: string, fingerprint: string, actorId: string, correlationId: string, aggregateId: string): Promise<"ACQUIRED" | "REPLAY" | "CONFLICT">;
  get(key: string): Promise<IdempotencyRecord | null>;
  complete(key: string, result: Readonly<Record<string, unknown>>): Promise<void>;
}>;

export function validateIdempotencyRecord(record: IdempotencyRecord): "READY" | "BLOCKED" {
  if (!record.key.trim() || !record.fingerprint.trim() || !record.actorId.trim() || !record.correlationId.trim() || !record.aggregateId.trim()) return "BLOCKED";
  if (record.state === "COMPLETED" && !record.result) return "BLOCKED";
  return "READY";
}

export function sameMutationIdentity(record: IdempotencyRecord, fingerprint: string, actorId: string, correlationId: string, aggregateId: string): boolean {
  return record.fingerprint === fingerprint && record.actorId === actorId && record.correlationId === correlationId && record.aggregateId === aggregateId;
}

export function assertReplaySafe(record: IdempotencyRecord, fingerprint: string, actorId: string, correlationId: string, aggregateId: string): void {
  if (!sameMutationIdentity(record, fingerprint, actorId, correlationId, aggregateId)) throw new Error("IDEMPOTENCY_IDENTITY_CONFLICT");
  if (record.state !== "COMPLETED" || !record.result) throw new Error("IDEMPOTENCY_REPLAY_NOT_COMPLETED");
}
