import { assertExecutionContextContinuity, createExecutionContext, type ExecutionContext } from "./execution-context-contract.js";
import type { TransactionContext } from "./transaction-contract.js";

export type DownstreamContextObservation = Readonly<{
  transaction?: Pick<TransactionContext, "requestId" | "correlationId" | "transactionId" | "idempotencyKey">;
  audit?: Pick<ExecutionContext, "requestId" | "correlationId" | "transactionId" | "idempotencyKey">;
  outbox?: Pick<ExecutionContext, "requestId" | "correlationId" | "transactionId" | "idempotencyKey">;
  observability?: Readonly<{
    requestId: string;
    correlationId: string;
    transactionId?: string;
  }>;
}>;

export function establishCriticalMutationContext(input: ExecutionContext): ExecutionContext {
  return createExecutionContext(input);
}

export function assertCriticalMutationContextContinuity(
  context: ExecutionContext,
  observed: DownstreamContextObservation,
): void {
  if (observed.transaction) assertExecutionContextContinuity(context, observed.transaction);
  if (observed.audit) assertExecutionContextContinuity(context, observed.audit);
  if (observed.outbox) assertExecutionContextContinuity(context, observed.outbox);

  if (observed.observability) {
    const observation = observed.observability;
    const downstream = observation.transactionId === undefined
      ? { requestId: observation.requestId, correlationId: observation.correlationId }
      : { requestId: observation.requestId, correlationId: observation.correlationId, transactionId: observation.transactionId };
    assertExecutionContextContinuity(context, downstream);
  }
}
