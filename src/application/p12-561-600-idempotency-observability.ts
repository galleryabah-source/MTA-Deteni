import type { IdempotencyRecord } from "./p12-161-200-persistent-idempotency-contract.js";

export type IdempotencyObservation = Readonly<{
  key: string;
  actorId: string;
  correlationId: string;
  aggregateId: string;
  outcome: "ACQUIRED" | "REPLAY" | "CONFLICT" | "COMPLETED" | "FAILED";
  observedAt: string;
}>;

export type IdempotencyObservationSink = Readonly<{
  record(observation: IdempotencyObservation): Promise<void>;
}>;

export function buildIdempotencyObservation(record: IdempotencyRecord, outcome: IdempotencyObservation["outcome"], observedAt: string): IdempotencyObservation {
  if (!record.key.trim() || !record.actorId.trim() || !record.correlationId.trim() || !record.aggregateId.trim() || !observedAt.trim()) throw new Error("IDEMPOTENCY_OBSERVATION_IDENTITY_REQUIRED");
  return { key: record.key, actorId: record.actorId, correlationId: record.correlationId, aggregateId: record.aggregateId, outcome, observedAt };
}

export function classifyIdempotencyFailure(error: unknown): "CONFLICT" | "FAILED" {
  return error instanceof Error && error.message.includes("CONFLICT") ? "CONFLICT" : "FAILED";
}
