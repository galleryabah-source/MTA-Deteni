import { assertExecutionContextContinuity, type ExecutionContext } from "./execution-context-contract.js";

export type ObservabilityLevel = "INFO" | "WARN" | "ERROR";

export type ObservabilityEvent = Readonly<{
  eventId: string;
  eventType: string;
  level: ObservabilityLevel;
  timestamp: string;
  correlationId: string;
  requestId: string;
  transactionId?: string;
  outcome: "STARTED" | "SUCCEEDED" | "FAILED";
  metadata?: Readonly<Record<string, string>>;
}>;

export type ObservabilitySink = Readonly<{
  emit: (event: ObservabilityEvent) => Promise<void>;
}>;

export function validateObservabilityEvent(event: ObservabilityEvent): void {
  const required = [event.eventId, event.eventType, event.timestamp, event.correlationId, event.requestId];
  if (required.some((value) => !value.trim())) throw new Error("OBSERVABILITY_IDENTITY_REQUIRED");
  if (event.transactionId !== undefined && !event.transactionId.trim()) throw new Error("OBSERVABILITY_TRANSACTION_ID_INVALID");
}

export function assertObservabilityContextContinuity(
  context: ExecutionContext,
  event: Pick<ObservabilityEvent, "requestId" | "correlationId" | "transactionId">,
): void {
  const downstream = event.transactionId === undefined
    ? { requestId: event.requestId, correlationId: event.correlationId }
    : { requestId: event.requestId, correlationId: event.correlationId, transactionId: event.transactionId };
  assertExecutionContextContinuity(context, downstream);
}

export async function emitObservabilityEvent(sink: ObservabilitySink, event: ObservabilityEvent): Promise<void> {
  validateObservabilityEvent(event);
  await sink.emit(Object.freeze({ ...event }));
}
