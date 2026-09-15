import type { DomainName } from "../domain/shared/contracts.js";

export type DomainAggregatePart = Readonly<{
  domain: DomainName;
  aggregateId: string;
  detaineeId: string;
  correlationId: string;
  sourceVersion: string;
}>;

export type DomainAggregateComposition = Readonly<{
  aggregateId: string;
  detaineeId: string;
  correlationId: string;
  parts: readonly DomainAggregatePart[];
}>;

export function composeDomainAggregate(parts: readonly DomainAggregatePart[]): DomainAggregateComposition {
  if (parts.length === 0) throw new Error("DOMAIN_AGGREGATE_PART_REQUIRED");
  const [first] = parts;
  if (!first.aggregateId.trim() || !first.detaineeId.trim() || !first.correlationId.trim()) throw new Error("DOMAIN_AGGREGATE_IDENTITY_REQUIRED");
  for (const part of parts) {
    if (part.aggregateId !== first.aggregateId || part.detaineeId !== first.detaineeId || part.correlationId !== first.correlationId) throw new Error("DOMAIN_AGGREGATE_IDENTITY_DRIFT");
    if (!part.sourceVersion.trim()) throw new Error("DOMAIN_AGGREGATE_SOURCE_VERSION_REQUIRED");
  }
  return { aggregateId: first.aggregateId, detaineeId: first.detaineeId, correlationId: first.correlationId, parts };
}
