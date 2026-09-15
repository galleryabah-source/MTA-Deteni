import type { OutboxMessage } from "../infrastructure/persistence/contracts.js";
import { OutboxReadModelProjector } from "./p12-321-344-outbox-read-model-projector.js";

export type ProjectionCheckpoint = Readonly<{ consumerId: string; lastMessageId: string | null; projectedCount: number }>;
export type ProjectionStore<T> = Readonly<{ apply(message: OutboxMessage): Promise<T>; checkpoint(value: ProjectionCheckpoint): Promise<void> }>;

export class RebuildableReadModel<T> {
  constructor(private readonly projector: OutboxReadModelProjector<T>, private readonly store: ProjectionStore<T>) {}

  async replay(messages: readonly OutboxMessage[], consumerId: string): Promise<ProjectionCheckpoint> {
    if (!consumerId.trim()) throw new Error("PROJECTION_CONSUMER_REQUIRED");
    let count = 0;
    let lastMessageId: string | null = null;
    for (const message of messages) {
      await this.projector.project(message);
      await this.store.apply(message);
      count += 1;
      lastMessageId = message.id;
      await this.store.checkpoint({ consumerId, lastMessageId, projectedCount: count });
    }
    return { consumerId, lastMessageId, projectedCount: count };
  }
}
