import type { ActorContext, AuditEvent } from "../domain/shared/contracts.js";

export type ApiAuditEnvelope = Readonly<{
  requestId: string;
  commandId: string;
  actor: ActorContext;
  correlationId: string;
  outcome: "ACCEPTED" | "REJECTED" | "FAILED";
  auditEventId?: string;
  errorCode?: string;
}>;

export function buildApiAuditEnvelope(input: Omit<ApiAuditEnvelope, "correlationId"> & { auditEvent?: AuditEvent }): ApiAuditEnvelope {
  if (!input.requestId.trim() || !input.commandId.trim() || !input.actor.actorId.trim() || !input.actor.correlationId.trim()) throw new Error("API_AUDIT_IDENTITY_REQUIRED");
  if (input.outcome === "ACCEPTED" && !input.auditEvent) throw new Error("API_AUDIT_EVENT_REQUIRED");
  if (input.outcome !== "ACCEPTED" && !input.errorCode?.trim()) throw new Error("API_AUDIT_ERROR_REQUIRED");
  return { requestId: input.requestId, commandId: input.commandId, actor: input.actor, correlationId: input.actor.correlationId, outcome: input.outcome, auditEventId: input.auditEvent?.eventId, errorCode: input.errorCode };
}
