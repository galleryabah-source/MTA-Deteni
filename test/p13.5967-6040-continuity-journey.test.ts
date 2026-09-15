import test from "node:test";
import assert from "node:assert/strict";
import { executeSyntheticContinuityJourney } from "../src/application/continuity-journey.js";

const device = { deviceId: "device-synthetic-01", installationId: "install-synthetic-01", networkScopeId: "lan-synthetic-01", deviceClass: "TABLET" as const };
const session = { sessionId: "session-01", device, authenticatedAt: "2026-09-15T10:00:00.000Z", expiresAt: "2026-09-15T11:00:00.000Z" };
const boundary = { mode: "LAN_ONLY" as const, allowsInternetExposure: false, requiresAuthenticatedDevice: true };
const backup = { schemaVersion: 1 as const, backupId: "backup-02", sourceRuntime: "LOCAL" as const, sourceDeviceId: device.deviceId, sourceInstallationId: device.installationId, createdAt: "2026-09-15T10:30:00.000Z", previousBackupId: "backup-01", payloadFingerprint: "payload-02", syntheticOnly: true as const };
const previousBackup = { schemaVersion: 1 as const, backupId: "backup-01", sourceRuntime: "LAN" as const, sourceDeviceId: device.deviceId, sourceInstallationId: device.installationId, createdAt: "2026-09-15T10:15:00.000Z", payloadFingerprint: "payload-01", syntheticOnly: true as const };

test("P13.5967-6040 integrated continuity journey completes deterministically", async () => {
  const result = await executeSyntheticContinuityJourney({
    command: { commandId: "cmd-01", aggregateId: "deteni-synthetic-01", commandType: "TEMPORARY_EXIT_RETURN", payloadHash: "rev-02", idempotencyKey: "idem-01", createdAt: "2026-09-15T10:20:00.000Z" },
    device,
    localBoundary: boundary,
    session,
    backup,
    previousBackup,
    now: "2026-09-15T10:30:00.000Z",
    executionId: "exec-synthetic-01",
    commitSha: "cf82ceb4528c42b629d9051c63111fabdd1d53cf",
  });

  assert.equal(result.reconciliation, "APPLY");
  assert.equal(result.command.state, "PENDING");
  assert.equal(result.snapshot.rows[0].backupId, "backup-02");
  assert.match(result.snapshotCanonical, /snapshot-cmd-01/);
  assert.equal(result.evidenceResult, "PASS");
});

test("P13.5967-6040 remains fail-closed for expired LAN session", async () => {
  await assert.rejects(
    executeSyntheticContinuityJourney({
      command: { commandId: "cmd-02", aggregateId: "deteni-synthetic-02", commandType: "TEMPORARY_EXIT_RETURN", payloadHash: "rev-03", idempotencyKey: "idem-02", createdAt: "2026-09-15T10:20:00.000Z" },
      device,
      localBoundary: boundary,
      session: { ...session, expiresAt: "2026-09-15T10:29:59.000Z" },
      backup,
      previousBackup,
      now: "2026-09-15T10:30:00.000Z",
      executionId: "exec-synthetic-02",
      commitSha: "cf82ceb4528c42b629d9051c63111fabdd1d53cf",
    }),
    /expired/,
  );
});
