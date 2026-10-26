export interface AuditEventInput {
  eventId: string;
  eventType: string;
  actorUserId: string;
  action: string;
  domain: string;
  resourceId?: string;
  correlationId: string;
  occurredAt: string;
  result: "SUCCESS" | "DENIED" | "FAILED";
  metadata?: Readonly<Record<string, string | number | boolean | null>>;
}

export interface AuditEvent extends AuditEventInput {
  sequence: number;
  previousHash: string;
  hash: string;
}

export interface AuditVerificationResult {
  valid: boolean;
  checked: number;
  failureSequence?: number;
}
