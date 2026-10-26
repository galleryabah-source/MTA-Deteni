import type { OutboxEventContract } from "./outbox-runtime-contract.js";
import { OutboxReadModelProjector } from "./p12-321-344-outbox-read-model-projector.js";

export type ProjectionCheckpoint = Readonly<{ consumerId: string; lastEventId: string | null; projectedCount: number }>;
export type ProjectionStore<T> = Readonly<{ apply(event: OutboxEventContract): Promise<T>; checkpoint(value: ProjectionCheckpoint): Promise<void> }>;

export class RebuildableReadModel<T> {
  constructor(private readonly projector: OutboxReadModelProjector<T>, private readonly store: ProjectionStore<T>) {}

  async replay(events: readonly OutboxEventContract[], consumerId: string): Promise<ProjectionCheckpoint> {
    if (!consumerId.trim()) throw new Error("PROJECTION_CONSUMER_REQUIRED");

    let count = 0;
    let lastEventId: string | null = null;

    for (const event of events) {
      await this.projector.project(event);
      await this.store.apply(event);
      count += 1;
      lastEventId = event.eventId;
      await this.store.checkpoint({ consumerId, lastEventId, projectedCount: count });
    }

    return { consumerId, lastEventId, projectedCount: count };
  }
}
