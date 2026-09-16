import type { ExecutionContext } from "./execution-context-contract.js";

export type TransactionOutcome = "COMMIT" | "ROLLBACK";

/**
 * TransactionContext is the canonical execution context at the transaction
 * boundary. This prevents identity fields from being redefined independently.
 */
export type TransactionContext = ExecutionContext;

export type TransactionRunner = <T>(context: TransactionContext, work: () => Promise<T>) => Promise<T>;

export async function runCriticalTransaction<T>(runner: TransactionRunner, context: TransactionContext, work: () => Promise<T>): Promise<T> {
  if (!context.transactionId.trim() || !context.requestId.trim() || !context.correlationId.trim() || !context.idempotencyKey.trim()) {
    throw new Error("Transaction context is incomplete.");
  }
  return runner(context, work);
}

export function assertCriticalTransactionBoundary(input: Readonly<{ mutation: boolean; transactional: boolean; audited: boolean; idempotent: boolean }>): void {
  if (input.mutation && (!input.transactional || !input.audited || !input.idempotent)) {
    throw new Error("Critical mutation requires transaction, mandatory audit and idempotency boundaries.");
  }
}
