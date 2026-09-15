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

export function canonicalAuditMaterial(event: Omit<AuditEvent, 'hash'>): string {
  return JSON.stringify({ hashVersion: event.hashVersion, eventId: event.eventId, actorId: event.actorId ?? null, action: event.action, resourceType: event.resourceType, resourceId: event.resourceId ?? null, result: event.result, requestId: event.requestId, correlationId: event.correlationId, policyVersion: event.policyVersion ?? null, scope: event.scope ?? null, occurredAt: event.occurredAt, previousHash: event.previousHash });
}

export function hashAuditEvent(event: Omit<AuditEvent, 'hash'>): string {
  return createHash('sha256').update(canonicalAuditMaterial(event), 'utf8').digest('hex');
}

export function appendAuditEvent(input: Omit<AuditEvent, 'hash' | 'previousHash'>, previousHash: string | null): AuditEvent {
  const candidate = { ...input, previousHash, hashVersion: 'AUDIT-HASH-V1' as const };
  return Object.freeze({ ...candidate, hash: hashAuditEvent(candidate) });
}

export function verifyAuditChain(events: readonly AuditEvent[]): boolean {
  let previousHash: string | null = null;
  for (const event of events) {
    if (event.previousHash !== previousHash) return false;
    const { hash, ...withoutHash } = event;
    if (hashAuditEvent(withoutHash) !== hash) return false;
    previousHash = hash;
  }
  return true;
}

export function auditChainEvidence(events: readonly AuditEvent[]) {
  if (!verifyAuditChain(events)) throw new Error('AUDIT_CHAIN_INVALID');
  return Object.freeze({ eventCount: events.length, headHash: events.length ? events[events.length - 1].hash : null });
}
