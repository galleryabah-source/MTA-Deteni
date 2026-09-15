import { test } from "node:test";
import assert from "node:assert/strict";
import { enqueueOfflineCommand, reconcileOfflineCommand } from "../src/application/offline-continuity.js";
import { applyReconnectTransition, createReconnectTransition } from "../src/application/runtime-adapters.js";
import { createReconnectEvidence } from "../src/application/reconnect-evidence.js";
import { assertReconnectProjectionCanonical, assertReconnectProjectionIntegrity, projectReconnectEvidence } from "../src/application/reconnect-reporting.js";
import { assertCanonicalReportingSnapshot, canonicalizeReportingSnapshot } from "../src/domain/reporting/snapshot.js";

function journey() {
  const command = enqueueOfflineCommand({ commandId: "cmd-cert-01", aggregateId: "det-synth-cert-01", commandType: "TEMPORARY_EXIT_REQUEST", payloadHash: "payload-cert", idempotencyKey: "idem-cert", createdAt: "2026-09-15T16:00:00Z" });
  const decision = reconcileOfflineCommand({ command, existingIdempotencyKeys: [], aggregateRevisionMatches: true });
  const transition = createReconnectTransition(command, decision);
  const synced = applyReconnectTransition(command, transition);
  const evidence = createReconnectEvidence(command, transition, "evidence-cert-01", "2026-09-15T16:01:00Z");
  const snapshot = projectReconnectEvidence({ snapshotId: "snapshot-cert-01", generatedAt: "2026-09-15T16:02:00Z", evidence });
  return { command, transition, synced, evidence, snapshot };
}

test("P13.6201 complete offline → reconnect → evidence → reporting journey is internally consistent", () => {
  const { command, transition, synced, evidence, snapshot } = journey();
  assert.equal(synced.state, "SYNCED");
  assert.equal(transition.commandId, command.commandId);
  assert.equal(snapshot.sourceRevision, evidence.commandId);
  assertReconnectProjectionIntegrity(snapshot, evidence);
});

test("P13.6202 reporting canonical form is deterministic and verifiable", () => {
  const { snapshot } = journey();
  const canonical = canonicalizeReportingSnapshot(snapshot);
  assertCanonicalReportingSnapshot(snapshot, canonical);
  assertReconnectProjectionCanonical(snapshot, canonical);
  assert.equal(canonical, canonicalizeReportingSnapshot(snapshot));
});

test("P13.6203 tampered projection source revision is rejected", () => {
  const { snapshot, evidence } = journey();
  const tampered = { ...snapshot, sourceRevision: "tampered-command" };
  assert.throws(() => assertReconnectProjectionIntegrity(tampered, evidence), /source revision mismatch/);
});

test("P13.6204 tampered evidence material is rejected", () => {
  const { snapshot, evidence } = journey();
  const tampered = { ...evidence, payloadHash: "tampered-payload" };
  assert.throws(() => assertReconnectProjectionIntegrity(snapshot, tampered), /evidence material mismatch/);
});

test("P13.6205 reporting snapshot rows are immutable at the row level", () => {
  const { snapshot } = journey();
  assert.throws(() => {
    (snapshot.rows[0] as Record<string, unknown>).decision = "APPLY_TAMPERED";
  }, TypeError);
});
