import type { CanonicalOperationalEnvelope } from "./p12-841-880-canonical-operational-envelope.js";

export type DomainAggregatePart<T> = Readonly<{
  domain: "RAP" | "PERKES" | "KAMTIB" | "SUBBAG_TU" | "LEADERSHIP";
  aggregateId: string;
  detaineeId: string;
  payload: T;
}>;

export type ComposedOperationalAggregate<T> = Readonly<{
  aggregateId: string;
  detaineeId: string;
  correlationId: string;
  operationId: string;
  parts: readonly DomainAggregatePart<T>[];
}>;

export function composeOperationalAggregate<T>(envelope: CanonicalOperationalEnvelope<T>, parts: readonly DomainAggregatePart<T>[]): ComposedOperationalAggregate<T> {
  if (parts.length === 0) throw new Error("DOMAIN_AGGREGATE_PARTS_REQUIRED");
  for (const part of parts) {
    if (part.aggregateId !== envelope.aggregateId || part.detaineeId !== envelope.detaineeId) throw new Error("DOMAIN_AGGREGATE_IDENTITY_DRIFT");
  }
  return { aggregateId: envelope.aggregateId, detaineeId: envelope.detaineeId, correlationId: envelope.correlationId, operationId: envelope.operationId, parts };
}
