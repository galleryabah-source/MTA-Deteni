import type { AuditEvent } from "../domain/shared/contracts.js";

export type TimelineEntry = Readonly<{
  eventId: string;
  eventType: string;
  aggregateId: string;
  actorId: string;
  correlationId: string;
  occurredAt: string;
  payloadHash: string;
}>;

export type ImmutableOperatorTimeline = Readonly<{
  aggregateId: string;
  entries: readonly TimelineEntry[];
}>;

export function composeImmutableTimeline(aggregateId: string, events: readonly AuditEvent[]): ImmutableOperatorTimeline {
  if (!aggregateId.trim()) throw new Error("TIMELINE_AGGREGATE_REQUIRED");
  const entries = events.filter((event) => event.aggregateId === aggregateId).map((event) => ({ eventId: event.eventId, eventType: event.eventType, aggregateId: event.aggregateId, actorId: event.actorId, correlationId: event.correlationId, occurredAt: event.occurredAt, payloadHash: event.payloadHash }));
  if (events.some((event) => event.aggregateId !== aggregateId)) throw new Error("TIMELINE_AGGREGATE_DRIFT");
  return { aggregateId, entries };
}

export function assertTimelineEntryOrder(timeline: ImmutableOperatorTimeline): void {
  for (let index = 1; index < timeline.entries.length; index += 1) {
    if (Date.parse(timeline.entries[index - 1].occurredAt) > Date.parse(timeline.entries[index].occurredAt)) throw new Error("TIMELINE_ORDER_INVALID");
  }
}
