import type { OutboxEventContract } from "./outbox-runtime-contract.js";

export type ReadModelProjectionPort<T> = Readonly<{
  project(event: OutboxEventContract): Promise<T>;
}>;

export type ProjectionResult = Readonly<{
  eventId: string;
  aggregateId: string;
  projected: boolean;
}>;

/** Event-driven projection boundary: the canonical committed outbox event is the source for eventual read-model updates. */
export class OutboxReadModelProjector<T> {
  private readonly projection: ReadModelProjectionPort<T>;

  constructor(projection: ReadModelProjectionPort<T>) {
    this.projection = projection;
  }

  async project(event: OutboxEventContract): Promise<ProjectionResult> {
    if (!event.eventId.trim() || !event.eventType.trim() || !event.aggregateId?.trim()) {
      throw new Error("CANONICAL_OUTBOX_IDENTITY_REQUIRED");
    }

    await this.projection.project(event);
    return { eventId: event.eventId, aggregateId: event.aggregateId, projected: true };
  }
}

export async function projectOutboxBatch<T>(
  events: readonly OutboxEventContract[],
  projector: OutboxReadModelProjector<T>,
): Promise<readonly ProjectionResult[]> {
  const results: ProjectionResult[] = [];
  for (const event of events) results.push(await projector.project(event));
  return results;
}
