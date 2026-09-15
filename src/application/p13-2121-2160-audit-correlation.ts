import type { AuditEvent } from "../domain/shared/contracts.js";

export type CorrelatedAuditChain = Readonly<{
  correlationId: string;
  eventIds: readonly string[];
}>;

export function composeCorrelatedAuditChain(correlationId: string, events: readonly AuditEvent[]): CorrelatedAuditChain {
  if (!correlationId.trim()) throw new Error("AUDIT_CORRELATION_REQUIRED");
  const relevant = events.filter((event) => event.correlationId === correlationId);
  if (events.some((event) => event.correlationId !== correlationId)) throw new Error("AUDIT_CORRELATION_DRIFT");
  return { correlationId, eventIds: relevant.map((event) => event.eventId) };
}
