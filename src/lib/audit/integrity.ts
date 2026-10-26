import { createHash } from "node:crypto";
import type { AuditEvent, AuditEventInput, AuditVerificationResult } from "./types";

const GENESIS = "GENESIS";

function canonicalize(event: AuditEventInput | AuditEvent): string {
  const normalized = {
    eventId: event.eventId,
    eventType: event.eventType,
    actorUserId: event.actorUserId,
    action: event.action,
    domain: event.domain,
    resourceId: event.resourceId ?? null,
    correlationId: event.correlationId,
    occurredAt: event.occurredAt,
    result: event.result,
    metadata: event.metadata ?? null,
  };
  return JSON.stringify(normalized);
}

export function sha256(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

export function appendAuditEvent(
  input: AuditEventInput,
  previous: AuditEvent | undefined,
): AuditEvent {
  const sequence = previous ? previous.sequence + 1 : 1;
  const previousHash = previous?.hash ?? GENESIS;
  const hash = sha256(`${sequence}|${previousHash}|${canonicalize(input)}`);
  return { ...input, sequence, previousHash, hash };
}

export function verifyAuditChain(events: readonly AuditEvent[]): AuditVerificationResult {
  let previousHash = GENESIS;
  let expectedSequence = 1;

  for (const event of events) {
    if (event.sequence !== expectedSequence || event.previousHash !== previousHash) {
      return { valid: false, checked: expectedSequence - 1, failureSequence: event.sequence };
    }

    const expectedHash = sha256(
      `${event.sequence}|${event.previousHash}|${canonicalize(event)}`,
    );
    if (event.hash !== expectedHash) {
      return { valid: false, checked: expectedSequence - 1, failureSequence: event.sequence };
    }

    previousHash = event.hash;
    expectedSequence += 1;
  }

  return { valid: true, checked: events.length };
}
