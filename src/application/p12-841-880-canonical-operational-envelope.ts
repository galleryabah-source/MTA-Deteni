import type { ActorContext } from "../domain/shared/contracts.js";

export type CanonicalOperationalEnvelope<T> = Readonly<{
  operationId: string;
  aggregateId: string;
  detaineeId: string;
  correlationId: string;
  actor: ActorContext;
  operationType: string;
  payload: T;
  occurredAt: string;
}>;

export function validateCanonicalOperationalEnvelope<T>(envelope: CanonicalOperationalEnvelope<T>): void {
  for (const value of [envelope.operationId, envelope.aggregateId, envelope.detaineeId, envelope.correlationId, envelope.operationType, envelope.occurredAt]) if (!value.trim()) throw new Error("CANONICAL_OPERATIONAL_ENVELOPE_REQUIRED");
  if (envelope.actor.actorId !== envelope.actor.actorId.trim() || envelope.actor.correlationId !== envelope.correlationId) throw new Error("CANONICAL_ACTOR_CORRELATION_MISMATCH");
}
