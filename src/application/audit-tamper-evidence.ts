import { createHash } from "node:crypto";

export const AUDIT_TAMPER_EVIDENCE_VERSION = "AUDIT-TAMPER-EVIDENCE-v1";

export type SyntheticAuditEvent = Readonly<{
  id: string;
  action: string;
  resourceType: string;
  resourceId: string;
  result: string;
  actorUserId: string;
  requestId: string;
  correlationId: string;
  occurredAt: string;
  metadata?: Readonly<Record<string, unknown>>;
}>;

export type ChainedAuditEvent = SyntheticAuditEvent & Readonly<{
  hashVersion: typeof AUDIT_TAMPER_EVIDENCE_VERSION;
  previousHash: string | null;
  eventHash: string;
}>;

function canonicalMaterial(event: SyntheticAuditEvent, previousHash: string | null): string {
  return AUDIT_TAMPER_EVIDENCE_VERSION + "|" + (previousHash ?? "GENESIS") + "|" +
    JSON.stringify({
      id: event.id,
      action: event.action,
      resourceType: event.resourceType,
      resourceId: event.resourceId,
      result: event.result,
      actorUserId: event.actorUserId,
      requestId: event.requestId,
      correlationId: event.correlationId,
      occurredAt: event.occurredAt,
      metadata: event.metadata ?? {},
    });
}

function hash(material: string): string {
  return createHash("sha256").update(material).digest("hex");
}

export function chainSyntheticAudit(events: readonly SyntheticAuditEvent[]): readonly ChainedAuditEvent[] {
  let previousHash: string | null = null;
  return Object.freeze(events.map(event => {
    const eventHash = hash(canonicalMaterial(event, previousHash));
    const chained = Object.freeze({ ...event, hashVersion: AUDIT_TAMPER_EVIDENCE_VERSION, previousHash, eventHash });
    previousHash = eventHash;
    return chained;
  }));
}

export type AuditIntegrityVerification = Readonly<{
  ok: boolean;
  status: "INTEGRITY_VERIFIED" | "INTEGRITY_COMPROMISED";
  checked: number;
  eventId?: string;
  lastHash: string | null;
}>;

export function verifySyntheticAuditChain(events: readonly ChainedAuditEvent[], expectedLastHash?: string | null): AuditIntegrityVerification {
  let previousHash: string | null = null;
  let checked = 0;
  for (const event of events) {
    checked += 1;
    if (event.hashVersion !== AUDIT_TAMPER_EVIDENCE_VERSION || event.previousHash !== previousHash) {
      return Object.freeze({ ok: false, status: "INTEGRITY_COMPROMISED", checked, eventId: event.id, lastHash: previousHash });
    }
    const expected = hash(canonicalMaterial(event, previousHash));
    if (event.eventHash !== expected) {
      return Object.freeze({ ok: false, status: "INTEGRITY_COMPROMISED", checked, eventId: event.id, lastHash: previousHash });
    }
    previousHash = event.eventHash;
  }
  if (expectedLastHash !== undefined && expectedLastHash !== previousHash) {\n    const lastEventId = events.length > 0 ? events[events.length - 1].id : undefined;\n    return lastEventId\n      ? Object.freeze({ ok: false, status: "INTEGRITY_COMPROMISED", checked, eventId: lastEventId, lastHash: previousHash })\n      : Object.freeze({ ok: false, status: "INTEGRITY_COMPROMISED", checked, lastHash: previousHash });\n  }
  return Object.freeze({ ok: true, status: "INTEGRITY_VERIFIED", checked, lastHash: previousHash });
}
