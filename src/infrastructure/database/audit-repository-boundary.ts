export const AUDIT_REPOSITORY_BOUNDARY_VERSION = "P9.19-v1";

export interface AuditRecord {
  eventId: string;
  actorId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  result: "SUCCESS" | "DENIED" | "FAILED";
  requestId: string;
  correlationId: string;
  policyVersion: string;
  occurredAt: string;
}

export interface AuditRepository {
  append(record: AuditRecord): Promise<void>;
}

export function validateAuditRecord(record: AuditRecord): boolean {
  return Boolean(
    record.eventId &&
    record.actorId &&
    record.action &&
    record.resourceType &&
    record.resourceId &&
    record.requestId &&
    record.correlationId &&
    record.policyVersion &&
    record.occurredAt
  );
}
