import type { AuditEvent, ActorContext } from "../domain/shared/contracts.js";

export type OperationalAuditView = Readonly<{
  aggregateId: string;
  viewerId: string;
  events: readonly AuditEvent[];
  readOnly: true;
}>;

const AUDIT_READ_ROLES = new Set(["OWNER", "AUDITOR"]);

export function composeOperationalAuditView(actor: ActorContext, aggregateId: string, events: readonly AuditEvent[]): OperationalAuditView {
  if (!actor.actorId.trim() || !actor.correlationId.trim()) throw new Error("AUDIT_VIEW_ACTOR_REQUIRED");
  if (!AUDIT_READ_ROLES.has(actor.role)) throw new Error("AUDIT_VIEW_ROLE_DENIED");
  if (!aggregateId.trim()) throw new Error("AUDIT_VIEW_AGGREGATE_REQUIRED");
  if (events.some((event) => event.aggregateId !== aggregateId)) throw new Error("AUDIT_VIEW_AGGREGATE_DRIFT");
  return { aggregateId, viewerId: actor.actorId, events: [...events], readOnly: true };
}
