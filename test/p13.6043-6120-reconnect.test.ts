import { test } from "node:test";
import assert from "node:assert/strict";
import { enqueueOfflineCommand, reconcileOfflineCommand } from "../src/application/offline-continuity.js";
import { applyReconnectTransition, createReconnectTransition } from "../src/application/runtime-adapters.js";

test("P13.6043 reconnect APPLY moves pending command to SYNCED", () => {
  const command = enqueueOfflineCommand({ commandId: "cmd-reconnect-apply", aggregateId: "det-synth-01", commandType: "TEMPORARY_EXIT_REQUEST", payloadHash: "payload-a", idempotencyKey: "idem-a", createdAt: "2026-09-15T14:00:00Z" });
  const decision = reconcileOfflineCommand({ command, existingIdempotencyKeys: [], aggregateRevisionMatches: true });
  const transition = createReconnectTransition(command, decision);
  assert.deepEqual({ from: transition.from, to: transition.to, decision: transition.decision }, { from: "PENDING", to: "SYNCED", decision: "APPLY" });
  assert.equal(applyReconnectTransition(command, transition).state, "SYNCED");
});

test("P13.6044 reconnect duplicate is terminally SYNCED without reapply", () => {
  const command = enqueueOfflineCommand({ commandId: "cmd-reconnect-dup", aggregateId: "det-synth-02", commandType: "TEMPORARY_EXIT_REQUEST", payloadHash: "payload-b", idempotencyKey: "idem-b", createdAt: "2026-09-15T14:01:00Z" });
  const decision = reconcileOfflineCommand({ command, existingIdempotencyKeys: ["idem-b"], aggregateRevisionMatches: true });
  const transition = createReconnectTransition(command, decision);
  assert.equal(transition.decision, "SKIP_DUPLICATE");
  assert.equal(applyReconnectTransition(command, transition).state, "SYNCED");
});

test("P13.6045 reconnect revision conflict is isolated as CONFLICT", () => {
  const command = enqueueOfflineCommand({ commandId: "cmd-reconnect-conflict", aggregateId: "det-synth-03", commandType: "TEMPORARY_EXIT_REQUEST", payloadHash: "payload-c", idempotencyKey: "idem-c", createdAt: "2026-09-15T14:02:00Z" });
  const decision = reconcileOfflineCommand({ command, existingIdempotencyKeys: [], aggregateRevisionMatches: false });
  const transition = createReconnectTransition(command, decision);
  assert.equal(transition.decision, "REVIEW_CONFLICT");
  assert.equal(applyReconnectTransition(command, transition).state, "CONFLICT");
});

test("P13.6046 reconnect rejects mismatched command identity and invalid source state", () => {
  const command = enqueueOfflineCommand({ commandId: "cmd-reconnect-guard", aggregateId: "det-synth-04", commandType: "TEMPORARY_EXIT_REQUEST", payloadHash: "payload-d", idempotencyKey: "idem-d", createdAt: "2026-09-15T14:03:00Z" });
  const decision = reconcileOfflineCommand({ command, existingIdempotencyKeys: [], aggregateRevisionMatches: true });
  assert.throws(() => createReconnectTransition(command, { ...decision, commandId: "wrong" }), /identity mismatch/);
  const synced = Object.freeze({ ...command, state: "SYNCED" as const });
  assert.throws(() => createReconnectTransition(synced, decision), /pending or syncing/);
});
