import { assertExecutionContextContinuity, createExecutionContext, type ExecutionContext } from "./execution-context-contract.js";
import type { TransactionContext } from "./transaction-contract.js";

export type DownstreamContextObservation = Readonly<{
  transaction?: Pick<TransactionContext, "requestId" | "correlationId" | "transactionId" | "idempotencyKey">;
  observability?: Readonly<{
    requestId: string;
    correlationId: string;
    transactionId?: string;
  }>;
}>;

/**
 * One fail-closed gate for the critical-mutation identity spine.
 * It normalizes the caller context once, then verifies every supplied
 * downstream identity against that same immutable context.
 */
export function establishCriticalMutationContext(input: ExecutionContext): ExecutionContext {
  return createExecutionContext(input);
}

export function assertCriticalMutationContextContinuity(
  context: ExecutionContext,
  observed: DownstreamContextObservation,
): void {
  if (observed.transaction) {
    assertExecutionContextContinuity(context, observed.transaction);
  }

  if (observed.observability) {
    assertExecutionContextContinuity(context, {
      requestId: observed.observability.requestId,
      correlationId: observed.observability.correlationId,
      transactionId: observed.observability.transactionId,
    });
  }
}
