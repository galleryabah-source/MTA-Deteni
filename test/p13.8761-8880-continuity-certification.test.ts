import test from "node:test";
import assert from "node:assert/strict";
import { certifyContinuity, assertContinuityCertification } from "../src/application/continuity-certification.js";
import { certifyLifecycleJourney } from "../src/application/lifecycle-certification.js";
import { executeSyntheticRecoveryJourney } from "../src/application/recovery-journey.js";
import { certifyRecoveryJourney } from "../src/application/recovery-certification.js";
import { assessRuntimeContinuity } from "../src/application/runtime-continuity-coordinator.js";
import { assessBackupContinuity } from "../src/application/runtime-backup-continuity.js";

test("unified continuity certification binds runtime, lifecycle, recovery and backup", () => {
  const steps = ["REGISTRATION", "PLACEMENT", "MOVEMENT", "TEMPORARY_EXIT", "REPORTING"].map((name, i) => ({ name: name as "REGISTRATION"|"PLACEMENT"|"MOVEMENT"|"TEMPORARY_EXIT"|"REPORTING", aggregateId: "DET-C", commandId: `CMD-C-${i}`, eventId: `EVT-C-${i}`, correlationId: "CORR-C", beforeVersion: i, afterVersion: i + 1, status: "COMMITTED" as const }));
  const lifecycle = certifyLifecycleJourney({ journeyId: "J-C", steps, auditCount: 5, outboxCount: 5, projectionVersion: 5 });
  const recoveryJourney = executeSyntheticRecoveryJourney({ journeyId: "J-C", commandId: "CMD-C-3", requestHash: "REQ-C-3", eventId: "EVT-C-3", correlationId: "CORR-C", aggregateId: "DET-C", expectedVersion: 3, failureClass: "OUTBOX_FAILURE", payloadHash: "FP-C-3" });
  const recovery = certifyRecoveryJourney({ ...recoveryJourney });
  const context = { executionId: "EXEC-C", runtimeMode: "LAN" as const, deviceClass: "TABLET" as const, networkScopeId: "NET-C", certificationJourneyId: "J-C", authenticated: true, syntheticOnly: true as const };
  const runtime = assessRuntimeContinuity({ context, queue: [] });
  const backup = assessBackupContinuity({ schemaVersion: 1, backupId: "B-C", sourceRuntime: "LAN", sourceDeviceId: "DEV-C", sourceInstallationId: "INST-C", createdAt: "2026-09-16T00:00:00Z", payloadFingerprint: "BFP-C", syntheticOnly: true });
  const certification = certifyContinuity({ certificationId: "CONT-C", context, lifecycle, recovery, runtime, backup });
  assertContinuityCertification(certification);
  assert.equal(certification.certified, true);
  assert.equal(certification.projectionVersion, 5);
});

test("blocked runtime continuity cannot be certified", () => {
  const steps = ["REGISTRATION", "PLACEMENT", "MOVEMENT", "TEMPORARY_EXIT", "REPORTING"].map((name, i) => ({ name: name as "REGISTRATION"|"PLACEMENT"|"MOVEMENT"|"TEMPORARY_EXIT"|"REPORTING", aggregateId: "DET-B", commandId: `CMD-B-${i}`, eventId: `EVT-B-${i}`, correlationId: "CORR-B", beforeVersion: i, afterVersion: i + 1, status: "COMMITTED" as const }));
  const lifecycle = certifyLifecycleJourney({ journeyId: "J-B", steps, auditCount: 5, outboxCount: 5, projectionVersion: 5 });
  const recoveryJourney = executeSyntheticRecoveryJourney({ journeyId: "J-B", commandId: "CMD-B-3", requestHash: "REQ-B-3", eventId: "EVT-B-3", correlationId: "CORR-B", aggregateId: "DET-B", expectedVersion: 3, failureClass: "OUTBOX_FAILURE", payloadHash: "FP-B-3" });
  const recovery = certifyRecoveryJourney({ ...recoveryJourney });
  const context = { executionId: "EXEC-B", runtimeMode: "LAN" as const, deviceClass: "TABLET" as const, networkScopeId: "NET-B", certificationJourneyId: "J-B", authenticated: true, syntheticOnly: true as const };
  const runtime = assessRuntimeContinuity({ context, queue: [{ commandId: "C-B", aggregateId: "DET-B", commandType: "MOVEMENT_RECORD", payloadHash: "FP-B", idempotencyKey: "I-B", createdAt: "2026-09-16T00:00:00Z", state: "PENDING" }] });
  const backup = assessBackupContinuity({ schemaVersion: 1, backupId: "B-B", sourceRuntime: "LAN", sourceDeviceId: "DEV-B", sourceInstallationId: "INST-B", createdAt: "2026-09-16T00:00:00Z", payloadFingerprint: "BFP-B", syntheticOnly: true });
  assert.throws(() => certifyContinuity({ certificationId: "CONT-B", context, lifecycle, recovery, runtime, backup }));
});
