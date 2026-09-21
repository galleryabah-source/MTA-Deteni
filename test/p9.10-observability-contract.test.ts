import assert from "node:assert/strict";
import test from "node:test";
import {
  OBSERVABILITY_CONTRACT_VERSION,
  redactSensitiveValue,
  validateObservabilityEvent,
} from "../src/infrastructure/observability/observability-contract";

const event = {
  eventId: "obs-001",
  timestamp: "2026-09-21T00:00:00.000Z",
  level: "INFO" as const,
  service: "mta-deteni",
  action: "HEALTHCHECK",
  requestId: "req-001",
  correlationId: "corr-001",
  result: "SUCCESS" as const,
  message: "synthetic healthcheck",
};

test("P9.10 exposes a versioned observability contract", () => {
  assert.equal(OBSERVABILITY_CONTRACT_VERSION, "P9.10-v1");
});

test("valid correlated event passes validation", () => {
  assert.doesNotThrow(() => validateObservabilityEvent(event));
});

test("missing correlation identity is rejected", () => {
  assert.throws(
    () => validateObservabilityEvent({ ...event, correlationId: "" }),
    /OBSERVABILITY_CORRELATIONID_REQUIRED/,
  );
});

test("sensitive values are never emitted through this redaction boundary", () => {
  assert.equal(redactSensitiveValue("secret"), "[REDACTED]");
  assert.equal(redactSensitiveValue({ password: "secret" }), "[REDACTED]");
});
