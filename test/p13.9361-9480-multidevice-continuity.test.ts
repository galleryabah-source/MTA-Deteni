import test from "node:test";
import assert from "node:assert/strict";
import { assessDeviceHandoff } from "../src/application/multidevice-continuity.js";
import type { OperationalSession } from "../src/application/offline-operational-session.js";

const context = { executionId: "EXEC-M", runtimeMode: "LAN" as const, deviceClass: "TABLET" as const, networkScopeId: "NET-M", certificationJourneyId: "J-M", authenticated: true, syntheticOnly: true as const };
const session: OperationalSession = { sessionId: "SES-M", executionId: "EXEC-M", deviceId: "DEV-A", installationId: "INST-M", networkScopeId: "NET-M", runtimeMode: "LAN", state: "ACTIVE", syntheticOnly: true };

test("same installation and network scope can produce authorized device handoff proof", () => {
  const proof = assessDeviceHandoff({ session, context, fromDeviceId: "DEV-A", toDeviceId: "DEV-B", installationId: "INST-M", networkScopeId: "NET-M", authorized: true });
  assert.equal(proof.decision, "READY");
});

test("network drift is fail-closed even with reconnect authorization", () => {
  const proof = assessDeviceHandoff({ session, context, fromDeviceId: "DEV-A", toDeviceId: "DEV-B", installationId: "INST-M", networkScopeId: "NET-DRIFT", authorized: true });
  assert.equal(proof.decision, "BLOCKED");
});

test("missing authorization is fail-closed", () => {
  const proof = assessDeviceHandoff({ session, context, fromDeviceId: "DEV-A", toDeviceId: "DEV-B", installationId: "INST-M", networkScopeId: "NET-M", authorized: false });
  assert.equal(proof.decision, "BLOCKED");
});
