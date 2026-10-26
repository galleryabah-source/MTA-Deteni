import type { OutboxEventContract } from "./outbox-runtime-contract.js";

export type ProjectionCheckpoint = Readonly<{
  projectorId: string;
  lastEventId: string | null;
  lastAggregateId: string | null;
  updatedAt: string;
}>;

export type ProjectionCheckpointStore = Readonly<{
  get(projectorId: string): Promise<ProjectionCheckpoint | null>;
  save(checkpoint: ProjectionCheckpoint): Promise<void>;
}>;

export type ProjectionAttempt = Readonly<{
  eventId: string;
  attempt: number;
  outcome: "PROJECTED" | "RETRYABLE_FAILURE" | "PERMANENT_FAILURE";
}>;

export function nextCheckpoint(projectorId: string, event: OutboxEventContract, updatedAt: string): ProjectionCheckpoint {
  if (!projectorId.trim() || !event.eventId.trim() || !event.aggregateId?.trim() || !updatedAt.trim()) throw new Error("PROJECTION_CHECKPOINT_IDENTITY_REQUIRED");
  return { projectorId, lastEventId: event.eventId, lastAggregateId: event.aggregateId, updatedAt };
}

export function shouldRetry(attempt: ProjectionAttempt): boolean {
  return attempt.outcome === "RETRYABLE_FAILURE" && attempt.attempt >= 1;
}

export async function projectWithCheckpoint<T>(
  event: OutboxEventContract,
  projectorId: string,
  checkpointStore: ProjectionCheckpointStore,
  project: (event: OutboxEventContract) => Promise<T>,
  updatedAt: string,
): Promise<T> {
  const current = await checkpointStore.get(projectorId);
  if (current?.lastEventId === event.eventId) return project(event);
  const result = await project(event);
  await checkpointStore.save(nextCheckpoint(projectorId, event, updatedAt));
  return result;
}
