import test from "node:test";
import assert from "node:assert/strict";
import { executeOfflineContinuityJourney } from "../src/application/offline-continuity-journey.js";
import { certifyLifecycleJourney } from "../src/application/lifecycle-certification.js";
import { executeSyntheticRecoveryJourney } from "../src/application/recovery-journey.js";
import { certifyRecoveryJourney } from "../src/application/recovery-certification.js";

const context = { executionId: "EXEC-J", runtimeMode: "LAN" as const, deviceClass: "TABLET" as const, networkScopeId: "NET-J", certificationJourneyId: "J-J", authenticated: true, syntheticOnly: true as const };
const commands = [
  { commandId: "CMD-J-1", aggregateId: "DET-J", commandType: "PLACEMENT_RECORD", payloadHash: "FP-J-1", idempotencyKey: "ID-J-1", createdAt: "2026-09-16T00:00:00Z", state: "PENDING" as const },
  { commandId: "CMD-J-2", aggregateId: "DET-J", commandType: "MOVEMENT_RECORD", payloadHash: "FP-J-2", idempotencyKey: "ID-J-2", createdAt: "2026-09-16T00:01:00Z", state: "PENDING" as const }
];

function prerequisites() {
  const steps = ["REGISTRATION", "PLACEMENT", "MOVEMENT", "TEMPORARY_EXIT", "REPORTING"].map((name, i) => ({ name: name as "REGISTRATION"|"PLACEMENT"|"MOVEMENT"|"TEMPORARY_EXIT"|"REPORTING", aggregateId: "DET-J", commandId: `CMD-L-${i}`, eventId: `EVT-L-${i}`, correlationId: "CORR-J", beforeVersion: i, afterVersion: i + 1, status: "COMMITTED" as const }));
  const lifecycle = certifyLifecycleJourney({ journeyId: "J-J", steps, auditCount: 5, outboxCount: 5, projectionVersion: 5 });
  const recoveryJourney = executeSyntheticRecoveryJourney({ journeyId: "J-J", commandId: "CMD-L-3", requestHash: "REQ-J-3", eventId: "EVT-L-3", correlationId: "CORR-J", aggregateId: "DET-J", expectedVersion: 3, failureClass: "OUTBOX_FAILURE", payloadHash: "FP-J-3" });
  const recovery = certifyRecoveryJourney({ ...recoveryJourney });
  const backupManifest = { schemaVersion: 1 as const, backupId: "B-J", sourceRuntime: "LAN" as const, sourceDeviceId: "DEV-J", sourceInstallationId: "INST-J", createdAt: "2026-09-16T00:00:00Z", payloadFingerprint: "BFP-J", syntheticOnly: true as const };
  return { lifecycle, recovery, backupManifest };
}

test("integrated offline journey preserves identities and ends in clean close", () => {
  const { lifecycle, recovery, backupManifest } = prerequisites();
  const result = executeOfflineContinuityJourney({ sessionId: "SES-J", context, deviceId: "DEV-J", installationId: "INST-J", commands, lifecycle, recovery, backupManifest });
  assert.equal(result.session.state, "CLOSED");
  assert.equal(result.clean, true);
  assert.equal(result.syntheticOnly, true);
  assert.equal(result.admittedCommands.length, 2);
  assert.equal(result.reconciledCommands.every((command) => command.state === "SYNCED"), true);
  assert.equal(result.receiptIds.length, 2);
  assert.equal(result.continuityCertificationId, "CONT-SES-J");
  assert.equal(result.cleanCloseEvidenceId, "SESSION-CLOSE-SES-J");
});

test("empty offline queue cannot masquerade as a completed operational journey", () => {
  const { lifecycle, recovery, backupManifest } = prerequisites();
  assert.throws(() => executeOfflineContinuityJourney({ sessionId: "SES-E", context, deviceId: "DEV-J", installationId: "INST-J", commands: [], lifecycle, recovery, backupManifest }));
});
