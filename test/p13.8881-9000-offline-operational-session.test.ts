import test from "node:test";
import assert from "node:assert/strict";
import { openOperationalSession, assertSessionScope, admitLocalCommand, assessSessionClose, closeOperationalSession, interruptOperationalSession, requireCleanHandoff } from "../src/application/offline-operational-session.js";
import { assessRuntimeContinuity } from "../src/application/runtime-continuity-coordinator.js";
import { assessBackupContinuity } from "../src/application/runtime-backup-continuity.js";
import { certifyContinuity } from "../src/application/continuity-certification.js";
import { certifyLifecycleJourney } from "../src/application/lifecycle-certification.js";
import { executeSyntheticRecoveryJourney } from "../src/application/recovery-journey.js";
import { certifyRecoveryJourney } from "../src/application/recovery-certification.js";

const context = { executionId: "EXEC-S", runtimeMode: "LAN" as const, deviceClass: "TABLET" as const, networkScopeId: "NET-S", certificationJourneyId: "J-S", authenticated: true, syntheticOnly: true as const };
const command = { commandId: "CMD-S", aggregateId: "DET-S", commandType: "MOVEMENT_RECORD", payloadHash: "FP-S", idempotencyKey: "ID-S", createdAt: "2026-09-16T00:00:00Z", state: "PENDING" as const };

function certifiedContinuity() {
  const steps = ["REGISTRATION", "PLACEMENT", "MOVEMENT", "TEMPORARY_EXIT", "REPORTING"].map((name, i) => ({ name: name as "REGISTRATION"|"PLACEMENT"|"MOVEMENT"|"TEMPORARY_EXIT"|"REPORTING", aggregateId: "DET-S", commandId: `CMD-S-${i}`, eventId: `EVT-S-${i}`, correlationId: "CORR-S", beforeVersion: i, afterVersion: i + 1, status: "COMMITTED" as const }));
  const lifecycle = certifyLifecycleJourney({ journeyId: "J-S", steps, auditCount: 5, outboxCount: 5, projectionVersion: 5 });
  const recoveryJourney = executeSyntheticRecoveryJourney({ journeyId: "J-S", commandId: "CMD-S-3", requestHash: "REQ-S-3", eventId: "EVT-S-3", correlationId: "CORR-S", aggregateId: "DET-S", expectedVersion: 3, failureClass: "OUTBOX_FAILURE", payloadHash: "FP-S-3" });
  const recovery = certifyRecoveryJourney({ ...recoveryJourney });
  const runtime = assessRuntimeContinuity({ context, queue: [] });
  const backup = assessBackupContinuity({ schemaVersion: 1, backupId: "B-S", sourceRuntime: "LAN", sourceDeviceId: "DEV-S", sourceInstallationId: "INST-S", createdAt: "2026-09-16T00:00:00Z", payloadFingerprint: "BFP-S", syntheticOnly: true });
  const continuity = certifyContinuity({ certificationId: "CONT-S", context, lifecycle, recovery, runtime, backup });
  return { runtime, backup, continuity };
}

test("active session admits local pending command", () => {
  const session = openOperationalSession({ sessionId: "SES-S", context, deviceId: "DEV-S", installationId: "INST-S" });
  assert.equal(admitLocalCommand({ session, context, deviceId: "DEV-S", installationId: "INST-S", command }), "ADMITTED");
});

test("session scope drift fails closed", () => {
  const session = openOperationalSession({ sessionId: "SES-D", context, deviceId: "DEV-S", installationId: "INST-S" });
  assert.throws(() => assertSessionScope(session, { ...context, networkScopeId: "NET-OTHER" }, "DEV-S", "INST-S"));
  assert.throws(() => assertSessionScope(session, context, "DEV-OTHER", "INST-S"));
  assert.throws(() => assertSessionScope(session, { ...context, authenticated: false }, "DEV-S", "INST-S"));
});

test("inactive or closed session rejects command admission", () => {
  const session = openOperationalSession({ sessionId: "SES-I", context, deviceId: "DEV-S", installationId: "INST-S" });
  const interrupted = interruptOperationalSession(session);
  assert.throws(() => admitLocalCommand({ session: interrupted, context, deviceId: "DEV-S", installationId: "INST-S", command }));
  assert.throws(() => requireCleanHandoff(interrupted));
});

test("clean close requires synchronized queue, ready backup and continuity certification", () => {
  const session = openOperationalSession({ sessionId: "SES-C", context, deviceId: "DEV-S", installationId: "INST-S" });
  const { runtime, backup, continuity } = certifiedContinuity();
  const synced = { ...command, state: "SYNCED" as const };
  const evidence = assessSessionClose({ session, context, deviceId: "DEV-S", installationId: "INST-S", queue: [synced], runtime, backup, continuity });
  const closed = closeOperationalSession(session, evidence);
  assert.equal(evidence.clean, true);
  assert.equal(closed.state, "CLOSED");
  requireCleanHandoff(closed);
});

test("pending queue or reconciliation conflict blocks clean close", () => {
  const session = openOperationalSession({ sessionId: "SES-B", context, deviceId: "DEV-S", installationId: "INST-S" });
  const { backup, continuity } = certifiedContinuity();
  const pendingRuntime = assessRuntimeContinuity({ context, queue: [command], reconciliation: { action: "APPLY" } });
  assert.throws(() => assessSessionClose({ session, context, deviceId: "DEV-S", installationId: "INST-S", queue: [command], runtime: pendingRuntime, backup, continuity }));
  const conflictRuntime = assessRuntimeContinuity({ context, queue: [command], reconciliation: { action: "REVIEW_CONFLICT" } });
  assert.throws(() => assessSessionClose({ session, context, deviceId: "DEV-S", installationId: "INST-S", queue: [command], reconciliation: { action: "REVIEW_CONFLICT" }, runtime: conflictRuntime, backup, continuity }));
});

test("interrupted session is never a clean handoff", () => {
  const session = openOperationalSession({ sessionId: "SES-X", context, deviceId: "DEV-S", installationId: "INST-S" });
  const interrupted = interruptOperationalSession(session);
  assert.equal(interrupted.state, "INTERRUPTED");
  assert.throws(() => requireCleanHandoff(interrupted));
  assert.throws(() => closeOperationalSession(interrupted, { evidenceId: "SESSION-CLOSE-SES-X", sessionId: "SES-X", executionId: "EXEC-S", deviceId: "DEV-S", installationId: "INST-S", networkScopeId: "NET-S", queueState: "SYNCED", backupReady: true, continuityCertificationId: "CONT-S", clean: true, syntheticOnly: true }));
});
