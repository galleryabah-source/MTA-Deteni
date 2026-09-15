import { test } from "node:test";
import assert from "node:assert/strict";
import { enqueueOfflineCommand, reconcileOfflineCommand } from "../src/application/offline-continuity.js";
import { createReconnectTransition } from "../src/application/runtime-adapters.js";
import { createReconnectEvidence } from "../src/application/reconnect-evidence.js";
import { projectReconnectEvidence } from "../src/application/reconnect-reporting.js";
import { createReconnectReportingArtifact } from "../src/application/reporting-artifact.js";
import { createReportingExportEnvelope, assertReportingExportEnvelope } from "../src/application/reporting-export.js";

function build() {
  const command = enqueueOfflineCommand({ commandId: "cmd-export-01", aggregateId: "det-synth-export-01", commandType: "MOVEMENT", payloadHash: "payload-export", idempotencyKey: "idem-export", createdAt: "2026-09-15T17:00:00Z" });
  const decision = reconcileOfflineCommand({ command, existingIdempotencyKeys: [], aggregateRevisionMatches: true });
  const transition = createReconnectTransition(command, decision);
  const evidence = createReconnectEvidence(command, transition, "evidence-export-01", "2026-09-15T17:01:00Z");
  const snapshot = projectReconnectEvidence({ snapshotId: "snapshot-export-01", generatedAt: "2026-09-15T17:02:00Z", evidence });
  const artifact = createReconnectReportingArtifact({ artifactId: "artifact-export-01", createdAt: "2026-09-15T17:03:00Z", snapshot, evidence });
  const envelope = createReportingExportEnvelope({ exportId: "export-01", artifact, snapshot, createdAt: "2026-09-15T17:04:00Z" });
  return { snapshot, artifact, envelope };
}

test("P13.6281 reporting export envelope preserves artifact binding", () => {
  const { snapshot, artifact, envelope } = build();
  assert.equal(envelope.artifactId, artifact.artifactId);
  assert.equal(envelope.snapshotId, snapshot.snapshotId);
  assert.equal(envelope.content, artifact.canonicalSnapshot);
  assert.doesNotThrow(() => assertReportingExportEnvelope(envelope, artifact, snapshot));
});

test("P13.6282 reporting export rejects altered content", () => {
  const { snapshot, artifact, envelope } = build();
  const altered = { ...envelope, content: envelope.content + "tampered" } as typeof envelope;
  assert.throws(() => assertReportingExportEnvelope(altered, artifact, snapshot), /content mismatch/);
});

test("P13.6283 reporting export rejects artifact/snapshot binding drift", () => {
  const { snapshot, artifact, envelope } = build();
  const alteredSnapshot = { ...snapshot, sourceRevision: "different-source" } as typeof snapshot;
  assert.throws(() => assertReportingExportEnvelope(envelope, artifact, alteredSnapshot), /artifact snapshot binding mismatch/);
});
