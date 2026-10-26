export const TRANSACTION_REPOSITORY_BRIDGE_VERSION = "P9.18-v1";

export interface TransactionContext {
  transactionId: string;
  requestId: string;
  correlationId: string;
  actorId: string;
  policyVersion: string;
}

export interface TransactionRunner {
  run<T>(context: TransactionContext, operation: (context: TransactionContext) => Promise<T>): Promise<T>;
}

export interface RepositoryOperation<T> {
  execute(context: TransactionContext): Promise<T>;
}

export async function runRepositoryOperation<T>(
  runner: TransactionRunner,
  operation: RepositoryOperation<T>,
  context: TransactionContext,
): Promise<T> {
  if (!context.transactionId || !context.requestId || !context.correlationId || !context.actorId || !context.policyVersion) {
    throw new Error("INVALID_TRANSACTION_CONTEXT");
  }
  return runner.run(context, (txContext) => operation.execute(txContext));
}
