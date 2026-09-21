export const OBSERVABILITY_CONTRACT_VERSION = "P9.10-v1";

export type LogLevel = "INFO" | "WARN" | "ERROR";

export interface CorrelatedLogEvent {
  eventId: string;
  timestamp: string;
  level: LogLevel;
  service: string;
  action: string;
  requestId: string;
  correlationId: string;
  result: "SUCCESS" | "DENIED" | "FAILED";
  message: string;
}

export function validateObservabilityEvent(event: CorrelatedLogEvent): void {
  const required = [
    ["eventId", event.eventId],
    ["timestamp", event.timestamp],
    ["service", event.service],
    ["action", event.action],
    ["requestId", event.requestId],
    ["correlationId", event.correlationId],
    ["message", event.message],
  ] as const;

  for (const [name, value] of required) {
    if (typeof value !== "string" || !value.trim()) {
      throw new Error("OBSERVABILITY_" + name.toUpperCase() + "_REQUIRED");
    }
  }
}

export function redactSensitiveValue(value: unknown): string {
  return "[REDACTED]";
}
