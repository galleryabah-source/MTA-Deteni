import type { OutboxMessage } from "../infrastructure/persistence/contracts.js";

export type ReadModelProjectionPort<T> = Readonly<{
  project(message: OutboxMessage): Promise<T>;
}>;

export type ProjectionResult = Readonly<{
  messageId: string;
  aggregateId: string;
  projected: boolean;
}>;

/** Event-driven projection boundary: committed outbox evidence is the source for eventual read-model updates. */
export class OutboxReadModelProjector<T> {
  constructor(private readonly projection: ReadModelProjectionPort<T>) {}

  async project(message: OutboxMessage): Promise<ProjectionResult> {
    if (!message.id.trim() || !message.topic.trim() || !message.aggregateId.trim()) throw new Error("OUTBOX_MESSAGE_IDENTITY_REQUIRED");
    await this.projection.project(message);
    return { messageId: message.id, aggregateId: message.aggregateId, projected: true };
  }
}

export async function projectOutboxBatch<T>(messages: readonly OutboxMessage[], projector: OutboxReadModelProjector<T>): Promise<readonly ProjectionResult[]> {
  const results: ProjectionResult[] = [];
  for (const message of messages) results.push(await projector.project(message));
  return results;
}
