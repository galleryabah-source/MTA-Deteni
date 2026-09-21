import test from "node:test";
import assert from "node:assert/strict";
import { createRuntimeHandoff, assertRuntimeHandoffSafety } from "../src/application/runtime-execution-boundary.js";

test("LAN to LOCAL handoff requires authorization and reconciliation", () => {
  const handoff = createRuntimeHandoff({ executionId: "EXEC-H", fromMode: "LAN", toMode: "LOCAL", fromDeviceId: "DEV-A", toDeviceId: "DEV-A", fromNetworkScopeId: "NET-A", toNetworkScopeId: "NET-A", authorizationId: "AUTH-H", queuePending: false });
  assert.equal(handoff.reconciliationRequired, true);
  assert.doesNotThrow(() => assertRuntimeHandoffSafety(handoff));
});

test("device and network drift cannot bypass reconciliation requirement", () => {
  assert.throws(() => createRuntimeHandoff({ executionId: "EXEC-H2", fromMode: "LAN", toMode: "LAN" as never, fromDeviceId: "DEV-A", toDeviceId: "DEV-B", fromNetworkScopeId: "NET-A", toNetworkScopeId: "NET-B", authorizationId: "AUTH-H2", queuePending: false }));
});

test("same runtime mode is rejected as a handoff", () => {
  assert.throws(() => createRuntimeHandoff({ executionId: "EXEC-H3", fromMode: "LAN", toMode: "LAN", fromDeviceId: "DEV-A", toDeviceId: "DEV-B", fromNetworkScopeId: "NET-A", toNetworkScopeId: "NET-A", authorizationId: "AUTH-H3", queuePending: false }));
});
