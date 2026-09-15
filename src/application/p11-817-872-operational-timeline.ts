import type { AuditEvent, ActorContext } from "../domain/shared/contracts.js";

export type OperationalTimelineEvent = Readonly<{
  sequence: number;
  eventId: string;
  aggregateType: string;
  aggregateId: string;
  eventType: string;
  actorId: string;
  correlationId: string;
  occurredAt: string;
  payloadHash: string;
}>;

export type OperationalTimeline = Readonly<{
  timelineId: string;
  aggregateId: string;
  events: readonly OperationalTimelineEvent[];
}>;

const nonBlank = (value: string) => value.trim().length > 0;

export function appendTimelineEvent(timeline: OperationalTimeline, event: AuditEvent): OperationalTimeline | null {
  if (!nonBlank(timeline.timelineId) || !nonBlank(timeline.aggregateId)) return null;
  if (event.aggregateId !== timeline.aggregateId || !nonBlank(event.eventId) || !nonBlank(event.payloadHash)) return null;
  if (timeline.events.some((existing) => existing.eventId === event.eventId)) return null;
  const last = timeline.events.at(-1);
  const sequence = (last?.sequence ?? 0) + 1;
  return {
    ...timeline,
    events: [...timeline.events, {
      sequence,
      eventId: event.eventId,
      aggregateType: event.aggregateType,
      aggregateId: event.aggregateId,
      eventType: event.eventType,
      actorId: event.actorId,
      correlationId: event.correlationId,
      occurredAt: event.occurredAt,
      payloadHash: event.payloadHash,
    }],
  };
}

export function validateTimeline(timeline: OperationalTimeline): "READY" | "BLOCKED" {
  if (!nonBlank(timeline.timelineId) || !nonBlank(timeline.aggregateId)) return "BLOCKED";
  return timeline.events.every((event, index) =>
    event.sequence === index + 1 &&
    nonBlank(event.eventId) &&
    nonBlank(event.aggregateType) &&
    event.aggregateId === timeline.aggregateId &&
    nonBlank(event.eventType) &&
    nonBlank(event.actorId) &&
    nonBlank(event.correlationId) &&
    nonBlank(event.occurredAt) &&
    nonBlank(event.payloadHash),
  ) ? "READY" : "BLOCKED";
}

export function actorCanAppend(actor: ActorContext, expectedDomain: ActorContext["domain"]): boolean {
  return nonBlank(actor.actorId) && actor.domain === expectedDomain && nonBlank(actor.correlationId);
}
