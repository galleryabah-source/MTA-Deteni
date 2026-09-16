export type ExecutionContext = Readonly<{
  requestId: string;
  correlationId: string;
  transactionId: string;
  idempotencyKey: string;
}>;

function required(value: string, code: string): string {
  const normalized = value.trim();
  if (!normalized) throw new Error(code);
  return normalized;
}

export function createExecutionContext(input: ExecutionContext): ExecutionContext {
  const context = Object.freeze({
    requestId: required(input.requestId, "REQUEST_ID_REQUIRED"),
    correlationId: required(input.correlationId, "CORRELATION_ID_REQUIRED"),
    transactionId: required(input.transactionId, "TRANSACTION_ID_REQUIRED"),
    idempotencyKey: required(input.idempotencyKey, "IDEMPOTENCY_KEY_REQUIRED"),
  });
  return context;
}

export function assertExecutionContextContinuity(
  context: ExecutionContext,
  observed: Readonly<Partial<ExecutionContext>>,
): void {
  const keys: Array<keyof ExecutionContext> = ["requestId", "correlationId", "transactionId", "idempotencyKey"];
  for (const key of keys) {
    if (observed[key] !== undefined && observed[key] !== context[key]) {
      throw new Error(`EXECUTION_CONTEXT_MISMATCH:${key}`);
    }
  }
}
