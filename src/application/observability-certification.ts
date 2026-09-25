import { assertExecutionContextContinuity, type ExecutionContext } from "./execution-context-contract.js";
import { validateObservabilityEvent, type ObservabilityEvent } from "./observability-contract.js";

export const OBSERVABILITY_CERTIFICATION_VERSION = "OBSERVABILITY-CERTIFICATION-v1";

const SENSITIVE_KEYS = new Set([
  "password", "token", "accessToken", "refreshToken", "authorization", "cookie",
  "secret", "apiKey", "credential", "nik", "passport", "healthRecord", "diagnosis",
  "medicalRecord", "rawDocument", "documentContent", "photoBase64",
]);

export type ObservabilityTraceEvent = Readonly<{
  stage: "SCAN" | "RESOLVE" | "AUTHORIZATION" | "ACTION" | "MUTATION" | "IDEMPOTENCY" | "AUDIT" | "OUTBOX" | "EVIDENCE" | "REPORT" | "DOCUMENT" | "RECOVERY";
  event: ObservabilityEvent;
}>;

export type ObservabilityCertification = Readonly<{
  version: typeof OBSERVABILITY_CERTIFICATION_VERSION;
  correlationId: string;
  requestId: string;
  stages: readonly ObservabilityTraceEvent["stage"][];
  eventCount: number;
  sensitiveFieldsBlocked: true;
  correlationCertified: true;
  certified: true;
  syntheticOnly: true;
}>;

const REQUIRED_STAGES: readonly ObservabilityTraceEvent["stage"][] = [
  "SCAN", "RESOLVE", "AUTHORIZATION", "ACTION", "MUTATION", "IDEMPOTENCY",
  "AUDIT", "OUTBOX", "EVIDENCE", "REPORT", "DOCUMENT", "RECOVERY",
];

function assertNonBlank(value: string, code: string): void {
  if (!value.trim()) throw new Error(code);
}

function assertNoSensitiveMetadata(event: ObservabilityEvent): void {
  const metadata = event.metadata ?? {};
  for (const key of Object.keys(metadata)) {
    if (SENSITIVE_KEYS.has(key)) throw new Error("OBSERVABILITY_SENSITIVE_METADATA_BLOCKED");
  }
}

export function assertTraceEventBinding(context: ExecutionContext, trace: ObservabilityTraceEvent): void {
  validateObservabilityEvent(trace.event);
  assertExecutionContextContinuity(context, {
    requestId: trace.event.requestId,
    correlationId: trace.event.correlationId,
    ...(trace.event.transactionId === undefined ? {} : { transactionId: trace.event.transactionId }),
  });
  assertNoSensitiveMetadata(trace.event);
}

export function certifyObservabilityTrace(input: {
  context: ExecutionContext;
  trace: readonly ObservabilityTraceEvent[];
}): ObservabilityCertification {
  assertNonBlank(input.context.requestId, "OBSERVABILITY_REQUEST_REQUIRED");
  assertNonBlank(input.context.correlationId, "OBSERVABILITY_CORRELATION_REQUIRED");
  if (input.trace.length !== REQUIRED_STAGES.length) throw new Error("OBSERVABILITY_TRACE_INCOMPLETE");

  input.trace.forEach((item) => assertTraceEventBinding(input.context, item));

  const stages = input.trace.map((item) => item.stage);
  for (let index = 0; index < REQUIRED_STAGES.length; index += 1) {
    if (stages[index] !== REQUIRED_STAGES[index]) throw new Error("OBSERVABILITY_STAGE_ORDER_DRIFT");
  }
  const eventIds = new Set<string>();
  for (const item of input.trace) {
    if (eventIds.has(item.event.eventId)) throw new Error("OBSERVABILITY_DUPLICATE_EVENT");
    eventIds.add(item.event.eventId);
  }

  return Object.freeze({
    version: OBSERVABILITY_CERTIFICATION_VERSION,
    correlationId: input.context.correlationId,
    requestId: input.context.requestId,
    stages: Object.freeze([...stages]),
    eventCount: input.trace.length,
    sensitiveFieldsBlocked: true,
    correlationCertified: true,
    certified: true,
    syntheticOnly: true,
  });
}
