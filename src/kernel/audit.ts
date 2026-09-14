import { createHash } from 'node:crypto';

export type AuditEvent = Readonly<{
  eventId: string;
  actorId?: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  result: 'SUCCESS' | 'DENIED' | 'FAILED';
  requestId: string;
  correlationId: string;
  policyVersion?: string;
  scope?: string;
  occurredAt: string;
  previousHash: string | null;
  hashVersion: 'AUDIT-HASH-V1';
  hash: string;
}>;

function canonicalMaterial(event: Omit<AuditEvent, 'hash'>): string {
  return JSON.stringify({
    hashVersion: event.hashVersion,
    eventId: event.eventId,
    actorId: event.actorId ?? null,
    action: event.action,
    resourceType: event.resourceType,
    resourceId: event.resourceId ?? null,
    result: event.result,
    requestId: event.requestId,
    correlationId: event.correlationId,
    policyVersion: event.policyVersion ?? null,
    scope: event.scope ?? null,
    occurredAt: event.occurredAt,
    previousHash: event.previousHash,
  });
}

export function hashAuditEvent(event: Omit<AuditEvent, 'hash'>): string {
  return createHash('sha256').update(canonicalMaterial(event), 'utf8').digest('hex');
}

export function appendAuditEvent(input: Omit<AuditEvent, 'hash' | 'previousHash'>, previousHash: string | null): AuditEvent {
  const candidate = { ...input, previousHash, hashVersion: 'AUDIT-HASH-V1' as const };
  return Object.freeze({ ...candidate, hash: hashAuditEvent(candidate) });
}

export function verifyAuditChain(events: readonly AuditEvent[]): boolean {
  let previousHash: string | null = null;
  for (const event of events) {
    if (event.previousHash !== previousHash) return false;
    if (hashAuditEvent({ ...event, hash: undefined } as Omit<AuditEvent, 'hash'>) !== event.hash) return false;
    previousHash = event.hash;
  }
  return true;
}
