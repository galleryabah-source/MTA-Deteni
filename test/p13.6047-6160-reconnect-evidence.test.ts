import { test } from "node:test";
import assert from "node:assert/strict";
import { enqueueOfflineCommand, reconcileOfflineCommand } from "../src/application/offline-continuity.js";
import { applyReconnectTransition, createReconnectTransition } from "../src/application/runtime-adapters.js";
import { assertReconnectEvidence, createReconnectEvidence } from "../src/application/reconnect-evidence.js";

test("P13.6047 reconnect transition produces immutable synthetic evidence", () => {
  const command = enqueueOfflineCommand({ commandId: "cmd-evidence-01", aggregateId: "det-synth-05", commandType: "TEMPORARY_EXIT_REQUEST", payloadHash: "payload-e", idempotencyKey: "idem-e", createdAt: "2026-09-15T14:10:00Z" });
  const decision = reconcileOfflineCommand({ command, existingIdempotencyKeys: [], aggregateRevisionMatches: true });
  const transition = createReconnectTransition(command, decision);
  const evidence = createReconnectEvidence(command, transition, "evidence-01", "2026-09-15T14:11:00Z");
  assert.doesNotThrow(() => assertReconnectEvidence(evidence));
  assert.equal(evidence.commandId, command.commandId);
  assert.equal(evidence.toState, "SYNCED");
  assert.equal(applyReconnectTransition(command, transition).state, evidence.toState);
});

test("P13.6048 duplicate and conflict evidence preserve reconciliation semantics", () => {
  const duplicate = enqueueOfflineCommand({ commandId: "cmd-evidence-dup", aggregateId: "det-synth-06", commandType: "MOVEMENT", payloadHash: "payload-f", idempotencyKey: "idem-f", createdAt: "2026-09-15T14:12:00Z" });
  const duplicateDecision = reconcileOfflineCommand({ command: duplicate, existingIdempotencyKeys: ["idem-f"], aggregateRevisionMatches: true });
  const duplicateEvidence = createReconnectEvidence(duplicate, createReconnectTransition(duplicate, duplicateDecision), "evidence-dup", "2026-09-15T14:13:00Z");
  assert.equal(duplicateEvidence.decision, "SKIP_DUPLICATE");
  assert.equal(duplicateEvidence.toState, "SYNCED");

  const conflict = enqueueOfflineCommand({ commandId: "cmd-evidence-conflict", aggregateId: "det-synth-07", commandType: "MOVEMENT", payloadHash: "payload-g", idempotencyKey: "idem-g", createdAt: "2026-09-15T14:14:00Z" });
  const conflictDecision = reconcileOfflineCommand({ command: conflict, existingIdempotencyKeys: [], aggregateRevisionMatches: false });
  const conflictEvidence = createReconnectEvidence(conflict, createReconnectTransition(conflict, conflictDecision), "evidence-conflict", "2026-09-15T14:15:00Z");
  assert.equal(conflictEvidence.decision, "REVIEW_CONFLICT");
  assert.equal(conflictEvidence.toState, "CONFLICT");
});

test("P13.6049 evidence cannot be fabricated from another command transition", () => {
  const command = enqueueOfflineCommand({ commandId: "cmd-evidence-guard", aggregateId: "det-synth-08", commandType: "MOVEMENT", payloadHash: "payload-h", idempotencyKey: "idem-h", createdAt: "2026-09-15T14:16:00Z" });
  const other = enqueueOfflineCommand({ commandId: "cmd-evidence-other", aggregateId: "det-synth-09", commandType: "MOVEMENT", payloadHash: "payload-i", idempotencyKey: "idem-i", createdAt: "2026-09-15T14:17:00Z" });
  const transition = createReconnectTransition(other, reconcileOfflineCommand({ command: other, existingIdempotencyKeys: [], aggregateRevisionMatches: true }));
  assert.throws(() => createReconnectEvidence(command, transition, "evidence-bad", "2026-09-15T14:18:00Z"), /command\/state mismatch/);
});
