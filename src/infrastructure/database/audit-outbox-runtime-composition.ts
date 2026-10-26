export const AUDIT_OUTBOX_RUNTIME_COMPOSITION_VERSION = "P10.35-v1";

export interface RuntimeAuditRecord {
  eventId: string;
  actorId: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  result: "SUCCESS" | "DENIED" | "FAILED";
  requestId: string;
  correlationId: string;
  policyVersion: string;
  occurredAt: string;
}

export interface RuntimeOutboxRecord {
  eventId: string;
  aggregateType: string;
  aggregateId: string;
  eventType: string;
  payloadHash: string;
  occurredAt: string;
  status: "PENDING" | "DISPATCHED" | "FAILED";
  attemptCount: number;
}

export interface AuditRepositoryPort {
  append(record: RuntimeAuditRecord): Promise<void>;
}

export interface OutboxRepositoryPort {
  append(record: RuntimeOutboxRecord): Promise<void>;
}

export interface RuntimeAuditOutboxPort {
  audit: AuditRepositoryPort;
  outbox: OutboxRepositoryPort;
}

export function validateAuditOutboxComposition(
  ports: RuntimeAuditOutboxPort,
): boolean {
  return typeof ports.audit?.append === "function" &&
    typeof ports.outbox?.append === "function";
}
