import type { OutboxMessage } from "../infrastructure/persistence/contracts.js";

export type ProjectionCheckpoint = Readonly<{
  projectorId: string;
  lastMessageId: string | null;
  lastAggregateId: string | null;
  updatedAt: string;
}>;

export type ProjectionCheckpointStore = Readonly<{
  get(projectorId: string): Promise<ProjectionCheckpoint | null>;
  save(checkpoint: ProjectionCheckpoint): Promise<void>;
}>;

export type ProjectionAttempt = Readonly<{
  messageId: string;
  attempt: number;
  outcome: "PROJECTED" | "RETRYABLE_FAILURE" | "PERMANENT_FAILURE";
}>;

export function nextCheckpoint(projectorId: string, message: OutboxMessage, updatedAt: string): ProjectionCheckpoint {
  if (!projectorId.trim() || !message.id.trim() || !message.aggregateId.trim() || !updatedAt.trim()) throw new Error("PROJECTION_CHECKPOINT_IDENTITY_REQUIRED");
  return { projectorId, lastMessageId: message.id, lastAggregateId: message.aggregateId, updatedAt };
}

export function shouldRetry(attempt: ProjectionAttempt): boolean {
  return attempt.outcome === "RETRYABLE_FAILURE" && attempt.attempt >= 1;
}

export async function projectWithCheckpoint<T>(
  message: OutboxMessage,
  projectorId: string,
  checkpointStore: ProjectionCheckpointStore,
  project: (message: OutboxMessage) => Promise<T>,
  updatedAt: string,
): Promise<T> {
  const current = await checkpointStore.get(projectorId);
  if (current?.lastMessageId === message.id) return project(message);
  const result = await project(message);
  await checkpointStore.save(nextCheckpoint(projectorId, message, updatedAt));
  return result;
}
