import test from "node:test";
import assert from "node:assert/strict";
import { openOperationalSession, interruptOperationalSession } from "../src/application/offline-operational-session.js";
import { captureInterruptedSession, authorizeReconnect, recoverInterruptedSession, reconcileRecoveredCommand } from "../src/application/offline-session-recovery.js";

const context = { executionId: "EXEC-R", runtimeMode: "LAN" as const, deviceClass: "TABLET" as const, networkScopeId: "NET-R", certificationJourneyId: "J-R", authenticated: true, syntheticOnly: true as const };
const commands = [{ commandId: "CMD-R-1", aggregateId: "DET-R", commandType: "PLACEMENT_RECORD", payloadHash: "FP-R", idempotencyKey: "ID-R", createdAt: "2026-09-16T00:00:00Z", state: "PENDING" as const }];

test("interrupted session recovers only through authorized scope-matched reconnect", () => {
  const opened = openOperationalSession({ sessionId: "SES-R", context, deviceId: "DEV-R", installationId: "INST-R" });
  const record = captureInterruptedSession({ session: opened, context, deviceId: "DEV-R", installationId: "INST-R", admittedCommands: commands, interruptedAt: "2026-09-16T00:02:00Z", reason: "SYNTHETIC_NETWORK_INTERRUPTION" });
  const interrupted = interruptOperationalSession(opened);
  const auth = authorizeReconnect({ record, context, session: interrupted, deviceId: "DEV-R", installationId: "INST-R", authorizationId: "AUTH-R", authorizedAt: "2026-09-16T00:03:00Z" });
  const recovered = recoverInterruptedSession({ record, authorization: auth, session: interrupted, context, deviceId: "DEV-R", installationId: "INST-R", queuedCommands: commands });
  assert.equal(recovered.state, "RECONCILIATION_REQUIRED");
  assert.equal(recovered.rehydratedCommands[0]?.state, "SYNCING");
  const synced = reconcileRecoveredCommand({ command: recovered.rehydratedCommands[0]!, decision: { commandId: "CMD-R-1", action: "APPLY" } });
  assert.equal(synced.state, "SYNCED");
});

test("stale network scope cannot authorize reconnect", () => {
  const opened = openOperationalSession({ sessionId: "SES-R2", context, deviceId: "DEV-R", installationId: "INST-R" });
  const record = captureInterruptedSession({ session: opened, context, deviceId: "DEV-R", installationId: "INST-R", admittedCommands: commands, interruptedAt: "2026-09-16T00:02:00Z", reason: "SYNTHETIC_NETWORK_INTERRUPTION" });
  const interrupted = interruptOperationalSession(opened);
  assert.throws(() => authorizeReconnect({ record, context: { ...context, networkScopeId: "NET-STALE" }, session: interrupted, deviceId: "DEV-R", installationId: "INST-R", authorizationId: "AUTH-R2", authorizedAt: "2026-09-16T00:03:00Z" }));
});
