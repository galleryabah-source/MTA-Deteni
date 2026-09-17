import type { ActorContext } from "../domain/shared/contracts.js";

export type CrossDomainIdentity = Readonly<{
  detaineeId: string;
  aggregateId: string;
  correlationId: string;
  actorId: string;
}>;

export type CrossDomainRecord = Readonly<{
  domain: "RAP" | "PERKES" | "KAMTIB" | "SUBBAG_TU" | "LEADERSHIP";
  identity: CrossDomainIdentity;
}>;

export function buildCrossDomainIdentity(actor: ActorContext, detaineeId: string, aggregateId: string): CrossDomainIdentity {
  if (!actor.actorId.trim() || !actor.correlationId.trim() || !detaineeId.trim() || !aggregateId.trim()) throw new Error("CROSS_DOMAIN_IDENTITY_REQUIRED");
  return { detaineeId, aggregateId, correlationId: actor.correlationId, actorId: actor.actorId };
}

export function assertCrossDomainConsistency(records: readonly CrossDomainRecord[]): "CONSISTENT" | "BLOCKED" {
  if (records.length === 0) return "BLOCKED";
  const [firstRecord] = records;
  if (!firstRecord) return "BLOCKED";
  const first = firstRecord.identity;
  return records.every(({ identity }) => identity.detaineeId === first.detaineeId && identity.aggregateId === first.aggregateId && identity.correlationId === first.correlationId) ? "CONSISTENT" : "BLOCKED";
}
