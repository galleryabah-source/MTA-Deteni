import type { ExecutionContext } from "./execution-context-contract.js";
import type { AuditEvent } from "../domain/shared/contracts.js";
import type { OutboxEvent } from "./outbox-contract.js";

export type CanonicalIdentityChain = Readonly<{
  execution: ExecutionContext;
  commandId: string;
  aggregateType: string;
  aggregateId: string;
  auditEventId: string;
  eventId: string;
  idempotencyKey: string;
  correlationId: string;
  payloadFingerprint: string;
  deliveryIdentity?: string;
  projectionIdentity?: string;
}>;

const required = (value: string, code: string): string => {
  const normalized = value.trim();
  if (!normalized) throw new Error(code);
  return normalized;
};

const same = (actual: string, expected: string, code: string): void => {
  if (actual !== expected) throw new Error(code);
};

export function createCanonicalIdentityChain(input: Readonly<{
  execution: ExecutionContext;
  commandId: string;
  aggregateType: string;
  aggregateId: string;
  audit: AuditEvent;
  outbox: Pick<OutboxEvent, "eventId" | "aggregateType" | "aggregateId" | "idempotencyKey">;
  payloadFingerprint: string;
  deliveryIdentity?: string;
  projectionIdentity?: string;
}>): CanonicalIdentityChain {
  const commandId = required(input.commandId, "CANONICAL_COMMAND_ID_REQUIRED");
  const aggregateType = required(input.aggregateType, "CANONICAL_AGGREGATE_TYPE_REQUIRED");
  const aggregateId = required(input.aggregateId, "CANONICAL_AGGREGATE_ID_REQUIRED");
  const auditEventId = required(input.audit.eventId, "CANONICAL_AUDIT_EVENT_ID_REQUIRED");
  const eventId = required(input.outbox.eventId, "CANONICAL_EVENT_ID_REQUIRED");
  const payloadFingerprint = required(input.payloadFingerprint, "CANONICAL_PAYLOAD_FINGERPRINT_REQUIRED");

  same(input.audit.aggregateType, aggregateType, "CANONICAL_AUDIT_AGGREGATE_TYPE_MISMATCH");
  same(input.audit.aggregateId, aggregateId, "CANONICAL_AUDIT_AGGREGATE_ID_MISMATCH");
  same(input.audit.correlationId, input.execution.correlationId, "CANONICAL_CORRELATION_ID_MISMATCH");
  same(input.outbox.aggregateType, aggregateType, "CANONICAL_OUTBOX_AGGREGATE_TYPE_MISMATCH");
  same(input.outbox.aggregateId ?? "", aggregateId, "CANONICAL_OUTBOX_AGGREGATE_ID_MISMATCH");
  same(input.outbox.idempotencyKey, input.execution.idempotencyKey, "CANONICAL_IDEMPOTENCY_KEY_MISMATCH");

  return Object.freeze({
    execution: input.execution,
    commandId,
    aggregateType,
    aggregateId,
    auditEventId,
    eventId,
    idempotencyKey: input.execution.idempotencyKey,
    correlationId: input.execution.correlationId,
    payloadFingerprint,
    ...(input.deliveryIdentity?.trim() ? { deliveryIdentity: input.deliveryIdentity.trim() } : {}),
    ...(input.projectionIdentity?.trim() ? { projectionIdentity: input.projectionIdentity.trim() } : {}),
  });
}

export function assertCanonicalIdentityContinuity(
  chain: CanonicalIdentityChain,
  observed: Readonly<Partial<Pick<CanonicalIdentityChain, "commandId" | "aggregateType" | "aggregateId" | "auditEventId" | "eventId" | "idempotencyKey" | "correlationId" | "payloadFingerprint" | "deliveryIdentity" | "projectionIdentity">>>,
): void {
  const keys: Array<keyof Omit<CanonicalIdentityChain, "execution">> = [
    "commandId", "aggregateType", "aggregateId", "auditEventId", "eventId",
    "idempotencyKey", "correlationId", "payloadFingerprint", "deliveryIdentity", "projectionIdentity",
  ];

  for (const key of keys) {
    if (observed[key] !== undefined && observed[key] !== chain[key]) {
      throw new Error(`CANONICAL_IDENTITY_MISMATCH:${key}`);
    }
  }
}

export function assertCanonicalOutboxReplayIdentity(
  existing: Pick<CanonicalIdentityChain, "eventId" | "idempotencyKey" | "aggregateType" | "aggregateId" | "payloadFingerprint">,
  candidate: Pick<CanonicalIdentityChain, "eventId" | "idempotencyKey" | "aggregateType" | "aggregateId" | "payloadFingerprint">,
): void {
  if (existing.eventId !== candidate.eventId) throw new Error("CANONICAL_EVENT_ID_DRIFT");
  if (existing.idempotencyKey !== candidate.idempotencyKey) throw new Error("CANONICAL_IDEMPOTENCY_KEY_DRIFT");
  if (existing.aggregateType !== candidate.aggregateType) throw new Error("CANONICAL_AGGREGATE_TYPE_DRIFT");
  if (existing.aggregateId !== candidate.aggregateId) throw new Error("CANONICAL_AGGREGATE_ID_DRIFT");
  if (existing.payloadFingerprint !== candidate.payloadFingerprint) throw new Error("CANONICAL_PAYLOAD_FINGERPRINT_DRIFT");
}
