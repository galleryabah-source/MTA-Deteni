import test from "node:test";
import assert from "node:assert/strict";
import { resolveRuntimeCapabilities } from "../src/application/runtime-continuity.js";
import { assertRuntimeExecutionContext, bindRuntimeToLifecycle, bindRuntimeToRecovery, createRuntimeHandoff, assertRuntimeHandoffSafety } from "../src/application/runtime-execution-boundary.js";
import { executeSyntheticRecoveryJourney } from "../src/application/recovery-journey.js";
import { certifyRecoveryJourney } from "../src/application/recovery-certification.js";
import { certifyLifecycleJourney } from "../src/application/lifecycle-certification.js";

const recovery = executeSyntheticRecoveryJourney({ journeyId: "J-RUNTIME", commandId: "CMD-RUNTIME", requestHash: "REQ-RUNTIME", eventId: "EVT-RUNTIME", correlationId: "CORR-RUNTIME", aggregateId: "DET-RUNTIME", expectedVersion: 1, failureClass: "OUTBOX_FAILURE", payloadHash: "FP-RUNTIME" });
const recoveryCertification = certifyRecoveryJourney({ ...recovery });
const lifecycleCertification = certifyLifecycleJourney({ journeyId: "J-RUNTIME", steps: [
  { name: "REGISTRATION", aggregateId: "DET-RUNTIME", commandId: "CMD-1", eventId: "EVT-1", correlationId: "CORR-RUNTIME", beforeVersion: 0, afterVersion: 1, status: "COMMITTED" },
  { name: "PLACEMENT", aggregateId: "DET-RUNTIME", commandId: "CMD-2", eventId: "EVT-2", correlationId: "CORR-RUNTIME", beforeVersion: 1, afterVersion: 2, status: "COMMITTED" },
  { name: "MOVEMENT", aggregateId: "DET-RUNTIME", commandId: "CMD-3", eventId: "EVT-3", correlationId: "CORR-RUNTIME", beforeVersion: 2, afterVersion: 3, status: "COMMITTED" },
  { name: "TEMPORARY_EXIT", aggregateId: "DET-RUNTIME", commandId: "CMD-4", eventId: "EVT-4", correlationId: "CORR-RUNTIME", beforeVersion: 3, afterVersion: 4, status: "COMMITTED" },
  { name: "REPORTING", aggregateId: "DET-RUNTIME", commandId: "CMD-5", eventId: "EVT-5", correlationId: "CORR-RUNTIME", beforeVersion: 4, afterVersion: 5, status: "COMMITTED" },
], auditCount: 5, outboxCount: 5, projectionVersion: 5 });

test("runtime execution is bound to authenticated capability and certification journey", () => {
  const capabilities = resolveRuntimeCapabilities("LAN", "TABLET");
  const context = { executionId: "EXEC-1", runtimeMode: "LAN" as const, deviceClass: "TABLET" as const, networkScopeId: "LAN-1", certificationJourneyId: "J-RUNTIME", authenticated: true, syntheticOnly: true as const };
  assert.doesNotThrow(() => assertRuntimeExecutionContext(context, capabilities));
  assert.doesNotThrow(() => bindRuntimeToLifecycle(context, lifecycleCertification));
  assert.doesNotThrow(() => bindRuntimeToRecovery(context, recoveryCertification));
  assert.throws(() => bindRuntimeToRecovery({ ...context, certificationJourneyId: "J-OTHER" }, recoveryCertification));
  assert.throws(() => assertRuntimeExecutionContext({ ...context, authenticated: false }, capabilities));
});

test("runtime mode handoff preserves authorization and reconciliation gates", () => {
  const handoff = createRuntimeHandoff({ executionId: "EXEC-2", fromMode: "LAN", toMode: "LOCAL", fromDeviceId: "DEV-1", toDeviceId: "DEV-2", fromNetworkScopeId: "LAN-1", toNetworkScopeId: "LAN-2", authorizationId: "AUTH-2", queuePending: true });
  assert.equal(handoff.reconciliationRequired, true);
  assert.equal(handoff.authorizationRequired, true);
  assert.doesNotThrow(() => assertRuntimeHandoffSafety(handoff));
  assert.throws(() => assertRuntimeHandoffSafety({ ...handoff, authorizationRequired: false } as never));
  assert.throws(() => assertRuntimeHandoffSafety({ ...handoff, reconciliationRequired: false } as never));
});
