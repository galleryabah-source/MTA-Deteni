import assert from "node:assert/strict";
import { test } from "node:test";

const moduleUrl = new URL("../src/application/workflow/runtime-command-orchestration.ts", import.meta.url);

const base = {
  authorized: true,
  idempotencyOutcome: "ACQUIRED",
  domainStateValid: true,
  runtimeReady: true,
  auditAvailable: true,
  outboxRequired: true,
  outboxAvailable: true,
};

test("P10.28 executes only after every required boundary is ready", async () => {
  const { decideRuntimeCommand } = await import(moduleUrl);
  assert.equal(decideRuntimeCommand(base), "EXECUTE");
});

test("P10.28 never executes a replay", async () => {
  const { decideRuntimeCommand } = await import(moduleUrl);
  assert.equal(decideRuntimeCommand({ ...base, idempotencyOutcome: "REPLAY" }), "REPLAY");
});

test("P10.28 blocks authorization failure", async () => {
  const { decideRuntimeCommand } = await import(moduleUrl);
  assert.equal(decideRuntimeCommand({ ...base, authorized: false }), "DENY_AUTHORIZATION");
});

test("P10.28 blocks invalid domain state", async () => {
  const { decideRuntimeCommand } = await import(moduleUrl);
  assert.equal(decideRuntimeCommand({ ...base, domainStateValid: false }), "DENY_STATE");
});

test("P10.28 blocks unavailable runtime", async () => {
  const { decideRuntimeCommand } = await import(moduleUrl);
  assert.equal(decideRuntimeCommand({ ...base, runtimeReady: false }), "BLOCKED_RUNTIME");
});

test("P10.28 fails closed when audit is unavailable", async () => {
  const { decideRuntimeCommand } = await import(moduleUrl);
  assert.equal(decideRuntimeCommand({ ...base, auditAvailable: false }), "BLOCKED_AUDIT");
});

test("P10.28 fails closed when required outbox is unavailable", async () => {
  const { decideRuntimeCommand } = await import(moduleUrl);
  assert.equal(decideRuntimeCommand({ ...base, outboxAvailable: false }), "BLOCKED_OUTBOX");
});

test("P10.28 rejects an incomplete envelope", async () => {
  const { isValidRuntimeCommandEnvelope } = await import(moduleUrl);
  assert.equal(isValidRuntimeCommandEnvelope({
    requestId: "req-1",
    correlationId: "corr-1",
    idempotencyKey: "idem-1",
    actorId: "actor-1",
    policyVersion: "p1",
    commandType: "",
  }), false);
});
