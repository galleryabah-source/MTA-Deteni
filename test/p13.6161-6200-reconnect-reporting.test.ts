import { test } from "node:test";
import assert from "node:assert/strict";
import { enqueueOfflineCommand, reconcileOfflineCommand } from "../src/application/offline-continuity.js";
import { createReconnectTransition } from "../src/application/runtime-adapters.js";
import { createReconnectEvidence } from "../src/application/reconnect-evidence.js";
import { projectReconnectEvidence } from "../src/application/reconnect-reporting.js";
import { canonicalizeReportingSnapshot } from "../src/domain/reporting/snapshot.js";

test("P13.6161 offline → reconnect → evidence → reporting is deterministic", () => {
  const command = enqueueOfflineCommand({ commandId: "cmd-report-01", aggregateId: "det-synth-report-01", commandType: "TEMPORARY_EXIT_REQUEST", payloadHash: "payload-report", idempotencyKey: "idem-report", createdAt: "2026-09-15T15:00:00Z" });
  const decision = reconcileOfflineCommand({ command, existingIdempotencyKeys: [], aggregateRevisionMatches: true });
  const transition = createReconnectTransition(command, decision);
  const evidence = createReconnectEvidence(command, transition, "evidence-report-01", "2026-09-15T15:01:00Z");
  const snapshot = projectReconnectEvidence({ snapshotId: "snapshot-report-01", generatedAt: "2026-09-15T15:02:00Z", evidence });
  assert.equal(snapshot.sourceRevision, command.commandId);
  assert.equal(snapshot.rows[0]?.decision, "APPLY");
  assert.equal(snapshot.rows[0]?.toState, "SYNCED");
  assert.equal(canonicalizeReportingSnapshot(snapshot), canonicalizeReportingSnapshot(projectReconnectEvidence({ snapshotId: "snapshot-report-01", generatedAt: "2026-09-15T15:02:00Z", evidence })));
});

test("P13.6162 duplicate and conflict remain visible in reporting projection", () => {
  const duplicate = enqueueOfflineCommand({ commandId: "cmd-report-dup", aggregateId: "det-synth-report-02", commandType: "MOVEMENT", payloadHash: "payload-dup", idempotencyKey: "idem-dup", createdAt: "2026-09-15T15:03:00Z" });
  const duplicateEvidence = createReconnectEvidence(duplicate, createReconnectTransition(duplicate, reconcileOfflineCommand({ command: duplicate, existingIdempotencyKeys: ["idem-dup"], aggregateRevisionMatches: true })), "evidence-report-dup", "2026-09-15T15:04:00Z");
  assert.equal(projectReconnectEvidence({ snapshotId: "snapshot-report-dup", generatedAt: "2026-09-15T15:05:00Z", evidence: duplicateEvidence }).rows[0]?.decision, "SKIP_DUPLICATE");

  const conflict = enqueueOfflineCommand({ commandId: "cmd-report-conflict", aggregateId: "det-synth-report-03", commandType: "MOVEMENT", payloadHash: "payload-conflict", idempotencyKey: "idem-conflict", createdAt: "2026-09-15T15:06:00Z" });
  const conflictEvidence = createReconnectEvidence(conflict, createReconnectTransition(conflict, reconcileOfflineCommand({ command: conflict, existingIdempotencyKeys: [], aggregateRevisionMatches: false })), "evidence-report-conflict", "2026-09-15T15:07:00Z");
  const projected = projectReconnectEvidence({ snapshotId: "snapshot-report-conflict", generatedAt: "2026-09-15T15:08:00Z", evidence: conflictEvidence });
  assert.equal(projected.rows[0]?.decision, "REVIEW_CONFLICT");
  assert.equal(projected.rows[0]?.toState, "CONFLICT");
});
