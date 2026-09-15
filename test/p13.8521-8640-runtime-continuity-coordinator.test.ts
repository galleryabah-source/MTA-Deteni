import test from "node:test";
import assert from "node:assert/strict";
import { assessRuntimeContinuity, assertRuntimeContinuityAssessment } from "../src/application/runtime-continuity-coordinator.js";
import { resolveRuntimeCapabilities } from "../src/application/runtime-continuity.js";
import { assertRuntimeExecutionContext, createRuntimeHandoff } from "../src/application/runtime-execution-boundary.js";

const context = { executionId: "EXEC-1", runtimeMode: "LAN" as const, deviceClass: "TABLET" as const, networkScopeId: "NET-1", certificationJourneyId: "J-1", authenticated: true, syntheticOnly: true as const };
const capabilities = resolveRuntimeCapabilities("LAN", "TABLET");

test("runtime continuity is ready when queue is fully synchronized", () => {
  assertRuntimeExecutionContext(context, capabilities);
  const result = assessRuntimeContinuity({ context, queue: [] });
  assertRuntimeContinuityAssessment(result);
  assert.equal(result.decision, "READY");
  assert.equal(result.queueState, "SYNCED");
});

test("pending queue requires reconciliation before continuity is ready", () => {
  const result = assessRuntimeContinuity({ context, queue: [{ commandId: "C-1", aggregateId: "DET-1", commandType: "MOVEMENT_RECORD", payloadHash: "FP-1", idempotencyKey: "I-1", createdAt: "2026-09-16T00:00:00Z", state: "PENDING" }] });
  assertRuntimeContinuityAssessment(result);
  assert.equal(result.decision, "RECONCILIATION_REQUIRED");
  assert.equal(result.queueState, "SYNCING");
});

test("reconnect conflict blocks continuity", () => {
  const result = assessRuntimeContinuity({
    context,
    queue: [{ commandId: "C-2", aggregateId: "DET-1", commandType: "MOVEMENT_RECORD", payloadHash: "FP-2", idempotencyKey: "I-2", createdAt: "2026-09-16T00:00:00Z", state: "PENDING" }],
    reconciliation: { commandId: "C-2", action: "REVIEW_CONFLICT", reason: "CONFLICT" as const },
  });
  assertRuntimeContinuityAssessment(result);
  assert.equal(result.decision, "BLOCKED");
  assert.equal(result.queueState, "CONFLICT");
});

test("runtime handoff preserves execution identity and reconciliation requirement", () => {
  const handoff = createRuntimeHandoff({ executionId: "EXEC-1", fromMode: "LOCAL", toMode: "LAN", queuePending: true });
  assert.equal(handoff.reconciliationRequired, true);
  assert.equal(handoff.authorizationRequired, true);
  assert.throws(() => assessRuntimeContinuity({ context, queue: [], handoff: { ...handoff, executionId: "EXEC-TAMPER" } }));
});
