import { assertIdempotencyKey, createIdempotencyRecord, resolveIdempotency, type IdempotencyRecord } from "./idempotency-contract.js";
import { appendMandatoryOutboxEvent, createOutboxEvent, type OutboxEventContract } from "./outbox-runtime-contract.js";
import { createExecutionContext, type ExecutionContext } from "./execution-context-contract.js";
import { assertCriticalMutationContextContinuity } from "./critical-mutation-context-contract.js";
import { assertCriticalTransactionBoundary, runCriticalTransaction, type TransactionContext, type TransactionRunner } from "./transaction-contract.js";

export type MutationAuditRecord = Readonly<{
  auditId: string;
  commandType: string;
  aggregateId: string;
  requestHash: string;
  executionContext: ExecutionContext;
  outcome: "COMMITTED" | "REPLAYED";
  recordedAt: string;
}>;

export type MutationIntegrationStores = Readonly<{
  findIdempotency: (key: string) => IdempotencyRecord | undefined;
  saveIdempotency: (record: IdempotencyRecord) => void;
  appendAudit: (record: MutationAuditRecord) => void;
  appendPending: (event: OutboxEventContract) => Promise<"ADMIT" | "REPLAY" | "CONFLICT">;
}>;

export type CriticalMutationInput<T> = Readonly<{
  context: ExecutionContext;
  commandType: string;
  aggregateId: string;
  requestHash: string;
  auditId: string;
  eventId: string;
  occurredAt: string;
  payload: Readonly<Record<string, unknown>>;
  payloadFingerprint: string;
  runDomainMutation: () => Promise<T>;
  responseFingerprint: string;
}>;

export async function executeCriticalMutation<T>(
  input: CriticalMutationInput<T>,
  stores: MutationIntegrationStores,
  transactionRunner: TransactionRunner,
): Promise<{ outcome: "COMMITTED" | "REPLAYED"; value: T | undefined }> {
  const context = createExecutionContext(input.context);
  assertIdempotencyKey(context.idempotencyKey);
  assertCriticalTransactionBoundary({ mutation: true, transactional: true, audited: true, idempotent: true });
  if (!input.commandType.trim() || !input.aggregateId.trim() || !input.requestHash.trim() || !input.auditId.trim() || !input.eventId.trim()) throw new Error("Critical mutation identity is incomplete.");

  const existing = stores.findIdempotency(context.idempotencyKey);
  const decision = resolveIdempotency(existing, input.requestHash);
  if (decision === "CONFLICT") throw new Error("IDEMPOTENCY_KEY_REUSED_WITH_DIFFERENT_REQUEST");
  if (decision === "REPLAY") return Object.freeze({ outcome: "REPLAYED", value: undefined });

  return runCriticalTransaction(transactionRunner, context as TransactionContext, async () => {
    const inProgress = createIdempotencyRecord({ idempotencyKey: context.idempotencyKey, commandType: input.commandType, requestHash: input.requestHash, status: "IN_PROGRESS", createdAt: input.occurredAt });
    stores.saveIdempotency(inProgress);
    const value = await input.runDomainMutation();
    const completed = createIdempotencyRecord({ ...inProgress, status: "COMPLETED", responseFingerprint: input.responseFingerprint, completedAt: input.occurredAt });
    stores.saveIdempotency(completed);
    const audit = { auditId: input.auditId, commandType: input.commandType, aggregateId: input.aggregateId, requestHash: input.requestHash, executionContext: context, outcome: "COMMITTED" as const, recordedAt: input.occurredAt };
    assertCriticalMutationContextContinuity(context, { audit: audit.executionContext });
    stores.appendAudit(audit);
    const event = createOutboxEvent({ eventId: input.eventId, aggregateType: input.commandType, aggregateId: input.aggregateId, eventType: `${input.commandType}_COMMITTED`, executionContext: context, payload: input.payload, payloadFingerprint: input.payloadFingerprint, occurredAt: input.occurredAt });
    assertCriticalMutationContextContinuity(context, { outbox: event.executionContext });
    const outboxDisposition = await appendMandatoryOutboxEvent(stores, event);
    if (outboxDisposition === "CONFLICT") throw new Error("OUTBOX_EVENT_ID_CONFLICT");
    if (outboxDisposition === "REPLAY") throw new Error("OUTBOX_EVENT_REPLAY_DURING_NEW_MUTATION");
    return Object.freeze({ outcome: "COMMITTED", value });
  });
}
