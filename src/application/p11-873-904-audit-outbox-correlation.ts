export type AuditOutboxCorrelation = Readonly<{
  correlationId: string;
  auditEventId: string;
  outboxMessageId: string;
  aggregateId: string;
  topic: string;
}>;

const nonBlank = (value: string) => value.trim().length > 0;

export function validateAuditOutboxCorrelation(value: AuditOutboxCorrelation): "READY" | "BLOCKED" {
  return nonBlank(value.correlationId) &&
    nonBlank(value.auditEventId) &&
    nonBlank(value.outboxMessageId) &&
    nonBlank(value.aggregateId) &&
    nonBlank(value.topic) ? "READY" : "BLOCKED";
}

export function sameCorrelation(a: AuditOutboxCorrelation, b: AuditOutboxCorrelation): boolean {
  return a.correlationId === b.correlationId && a.aggregateId === b.aggregateId;
}
