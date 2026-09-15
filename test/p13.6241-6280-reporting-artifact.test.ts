import { test } from "node:test";
import assert from "node:assert/strict";
import { enqueueOfflineCommand, reconcileOfflineCommand } from "../src/application/offline-continuity.js";
import { createReconnectTransition } from "../src/application/runtime-adapters.js";
import { createReconnectEvidence } from "../src/application/reconnect-evidence.js";
import { projectReconnectEvidence } from "../src/application/reconnect-reporting.js";
import { createReconnectReportingArtifact, assertReportingArtifactIntegrity } from "../src/application/reporting-artifact.js";

function journey() {
  const command = enqueueOfflineCommand({ commandId: "cmd-artifact-01", aggregateId: "det-synth-artifact-01", commandType: "TEMPORARY_EXIT_REQUEST", payloadHash: "payload-artifact", idempotencyKey: "idem-artifact", createdAt: "2026-09-15T16:00:00Z" });
  const decision = reconcileOfflineCommand({ command, existingIdempotencyKeys: [], aggregateRevisionMatches: true });
  const transition = createReconnectTransition(command, decision);
  const evidence = createReconnectEvidence(command, transition, "evidence-artifact-01", "2026-09-15T16:01:00Z");
  const snapshot = projectReconnectEvidence({ snapshotId: "snapshot-artifact-01", generatedAt: "2026-09-15T16:02:00Z", evidence });
  const artifact = createReconnectReportingArtifact({ artifactId: "artifact-01", createdAt: "2026-09-15T16:03:00Z", snapshot, evidence });
  return { command, evidence, snapshot, artifact };
}

test("P13.6241 reporting artifact binds snapshot, source revision and canonical content", () => {
  const { snapshot, artifact } = journey();
  assert.equal(artifact.snapshotId, snapshot.snapshotId);
  assert.equal(artifact.sourceRevision, snapshot.sourceRevision);
  assert.equal(artifact.syntheticOnly, true);
  assert.doesNotThrow(() => assertReportingArtifactIntegrity(artifact, snapshot));
});

test("P13.6242 reporting artifact rejects tampered snapshot material", () => {
  const { snapshot, artifact } = journey();
  const tampered = { ...snapshot, rows: [{ ...snapshot.rows[0], decision: "REVIEW_CONFLICT" }] } as typeof snapshot;
  assert.throws(() => assertReportingArtifactIntegrity(artifact, tampered), /canonical snapshot mismatch/);
});

test("P13.6243 reporting artifact creation rejects evidence/snapshot mismatch", () => {
  const { snapshot, evidence } = journey();
  const alteredEvidence = { ...evidence, commandId: "different-command" } as typeof evidence;
  assert.throws(() => createReconnectReportingArtifact({ artifactId: "artifact-invalid", createdAt: "2026-09-15T16:04:00Z", snapshot, evidence: alteredEvidence }), /source revision mismatch/);
});
