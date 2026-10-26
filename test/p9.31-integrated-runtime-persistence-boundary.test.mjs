import assert from "node:assert/strict";
import { test } from "node:test";

const moduleUrl = new URL("../src/infrastructure/database/integrated-runtime-persistence-boundary.ts", import.meta.url);

test("P9.31 blocks when runtime is unavailable", async () => {
  const { evaluateIntegratedRuntimePersistence } = await import(moduleUrl);
  assert.equal(
    evaluateIntegratedRuntimePersistence({
      runtimeReady: false,
      transactionReady: true,
      auditAvailable: true,
      outboxRequired: false,
      outboxAvailable: false,
    }),
    "BLOCKED_RUNTIME",
  );
});

test("P9.31 blocks when transaction boundary is unavailable", async () => {
  const { evaluateIntegratedRuntimePersistence } = await import(moduleUrl);
  assert.equal(
    evaluateIntegratedRuntimePersistence({
      runtimeReady: true,
      transactionReady: false,
      auditAvailable: true,
      outboxRequired: false,
      outboxAvailable: false,
    }),
    "BLOCKED_TRANSACTION",
  );
});

test("P9.31 requires audit evidence", async () => {
  const { evaluateIntegratedRuntimePersistence } = await import(moduleUrl);
  assert.equal(
    evaluateIntegratedRuntimePersistence({
      runtimeReady: true,
      transactionReady: true,
      auditAvailable: false,
      outboxRequired: false,
      outboxAvailable: false,
    }),
    "BLOCKED_AUDIT",
  );
});

test("P9.31 requires outbox when policy says it is required", async () => {
  const { evaluateIntegratedRuntimePersistence } = await import(moduleUrl);
  assert.equal(
    evaluateIntegratedRuntimePersistence({
      runtimeReady: true,
      transactionReady: true,
      auditAvailable: true,
      outboxRequired: true,
      outboxAvailable: false,
    }),
    "BLOCKED_OUTBOX",
  );
});

test("P9.31 reaches READY only when every required boundary is available", async () => {
  const { evaluateIntegratedRuntimePersistence } = await import(moduleUrl);
  assert.equal(
    evaluateIntegratedRuntimePersistence({
      runtimeReady: true,
      transactionReady: true,
      auditAvailable: true,
      outboxRequired: true,
      outboxAvailable: true,
    }),
    "READY",
  );
});

test("P9.31 rejects incomplete mutation identity", async () => {
  const { validateRuntimeMutationEnvelope } = await import(moduleUrl);
  assert.equal(
    validateRuntimeMutationEnvelope({
      requestId: "req-1",
      correlationId: "corr-1",
      idempotencyKey: "",
      actorId: "actor-1",
      policyVersion: "p1",
    }),
    false,
  );
});
