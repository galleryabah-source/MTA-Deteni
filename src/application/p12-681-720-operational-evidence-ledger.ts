import type { AuditEvent } from "../domain/shared/contracts.js";

export type OperationalEvidence = Readonly<{
  evidenceId: string;
  aggregateId: string;
  eventId: string;
  eventType: string;
  actorId: string;
  correlationId: string;
  occurredAt: string;
  payloadHash: string;
}>;

export function toOperationalEvidence(event: AuditEvent): OperationalEvidence {
  if (!event.eventId.trim() || !event.aggregateId.trim() || !event.actorId.trim() || !event.correlationId.trim() || !event.payloadHash.trim()) throw new Error("EVIDENCE_IDENTITY_REQUIRED");
  return { evidenceId: event.eventId, aggregateId: event.aggregateId, eventId: event.eventId, eventType: event.eventType, actorId: event.actorId, correlationId: event.correlationId, occurredAt: event.occurredAt, payloadHash: event.payloadHash };
}

export function assertEvidenceAppendOnly(previous: OperationalEvidence | null, next: OperationalEvidence): void {
  if (!previous) return;
  if (previous.evidenceId === next.evidenceId) throw new Error("EVIDENCE_DUPLICATE");
  if (previous.occurredAt > next.occurredAt) throw new Error("EVIDENCE_ORDER_VIOLATION");
}
