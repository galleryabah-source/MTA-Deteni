export type TransactionOutcome = "COMMIT" | "ROLLBACK";

export type TransactionContext = Readonly<{
  transactionId: string;
  requestId: string;
  correlationId: string;
  idempotencyKey?: string;
}>;

export type TransactionRunner = <T>(context: TransactionContext, work: () => Promise<T>) => Promise<T>;

export async function runCriticalTransaction<T>(runner: TransactionRunner, context: TransactionContext, work: () => Promise<T>): Promise<T> {
  if (!context.transactionId.trim() || !context.requestId.trim() || !context.correlationId.trim()) throw new Error("Transaction context is incomplete.");
  return runner(context, work);
}

export function assertCriticalTransactionBoundary(input: Readonly<{ mutation: boolean; transactional: boolean; audited: boolean; idempotent: boolean }>): void {
  if (input.mutation && (!input.transactional || !input.audited || !input.idempotent)) {
    throw new Error("Critical mutation requires transaction, mandatory audit and idempotency boundaries.");
  }
}
