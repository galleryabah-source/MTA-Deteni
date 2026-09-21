import test from "node:test";
import assert from "node:assert/strict";
import {
  evaluateSyntheticE2E,
  SYNTHETIC_E2E_COMMAND_CONTRACT_VERSION,
} from "../src/application/testing/synthetic-e2e-command-contract.js";

const ready = {
  syntheticOnly: true,
  authorized: true,
  idempotency: "ACQUIRED" as const,
  stateValid: true,
  runtimeReady: true,
  auditAvailable: true,
  outboxRequired: true,
  outboxAvailable: true,
};

test("P10.36 exposes a versioned synthetic-only gate", () => {
  assert.equal(SYNTHETIC_E2E_COMMAND_CONTRACT_VERSION, "P10.36-v1");
  assert.throws(
    () => evaluateSyntheticE2E({ ...ready, syntheticOnly: false }),
    /SYNTHETIC_ONLY_REQUIRED/,
  );
});

test("P10.36 permits execution only when every prerequisite is satisfied", () => {
  assert.equal(evaluateSyntheticE2E(ready), "READY_FOR_EXECUTION");
  assert.equal(evaluateSyntheticE2E({ ...ready, authorized: false }), "BLOCKED_AUTHORIZATION");
  assert.equal(evaluateSyntheticE2E({ ...ready, idempotency: "REPLAY" }), "BLOCKED_IDEMPOTENCY");
  assert.equal(evaluateSyntheticE2E({ ...ready, idempotency: "CONFLICT" }), "BLOCKED_IDEMPOTENCY");
  assert.equal(evaluateSyntheticE2E({ ...ready, stateValid: false }), "BLOCKED_STATE");
  assert.equal(evaluateSyntheticE2E({ ...ready, runtimeReady: false }), "BLOCKED_RUNTIME");
  assert.equal(evaluateSyntheticE2E({ ...ready, auditAvailable: false }), "BLOCKED_AUDIT");
  assert.equal(evaluateSyntheticE2E({ ...ready, outboxAvailable: false }), "BLOCKED_OUTBOX");
});
