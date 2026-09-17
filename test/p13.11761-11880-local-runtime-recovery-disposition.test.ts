import assert from "node:assert/strict";
import test from "node:test";
import { createLocalRuntimeFailureEvidence } from "../src/application/local-runtime-failure-evidence.js";
import { createLocalRuntimeRecoveryDisposition, assertLocalRuntimeRecoveryDisposition } from "../src/application/local-runtime-recovery-disposition.js";
import type { LocalRuntimeRequest, LocalRuntimeResponse } from "../src/application/local-runtime-adapter.js";
import type { OperationalSession } from "../src/application/offline-operational-session.js";
import type { RuntimeExecutionContext } from "../src/application/runtime-execution-boundary.js";

const context = { executionId: "EXEC-R", runtimeMode: "LOCAL", deviceClass: "DESKTOP", networkScopeId: "NET-R", certificationJourneyId: "J-R", authenticated: true, syntheticOnly: true } as RuntimeExecutionContext;
const session = { sessionId: "S-R", executionId: "EXEC-R", deviceId: "DEV-R", installationId: "INST-R", networkScopeId: "NET-R", runtimeMode: "LOCAL", state: "ACTIVE", syntheticOnly: true } as OperationalSession;
const request = { requestId: "REQ-R", actorId: "ACT-R", device: { deviceId: "DEV-R", installationId: "INST-R", networkScopeId: "NET-R", deviceClass: "DESKTOP" }, method: "POST", path: "/mta-local/mutate", headers: {}, idempotencyKey: "IDEMP-R", boundary: { serviceId: "SVC-R", listenScope: "LOOPBACK_ONLY", requiresAuthenticatedDevice: true, allowsInternetExposure: false } } as LocalRuntimeRequest;

function evidence(failureClass: "EXECUTION_REJECTED" | "REQUEST_REJECTED") {
  return createLocalRuntimeFailureEvidence({ evidenceId: "E-R", failureId: "FAIL-R", failureClass, request, response: { requestId: "REQ-R", status: "REJECTED", syntheticOnly: true } as LocalRuntimeResponse, session, context, observedAt: "2026-09-16T02:00:00Z" });
}

test("P13.11761-11880: recovery disposition is deterministically bound to failure evidence", () => {
  const disposition = createLocalRuntimeRecoveryDisposition({ dispositionId: "DISP-R", evidence: evidence("EXECUTION_REJECTED"), scenario: "RECONCILIATION_REQUIRED" });
  assert.equal(disposition.disposition, "RECONCILE_BEFORE_RETRY");
  assert.equal(disposition.retryAllowed, false);
  assertLocalRuntimeRecoveryDisposition(disposition);
});

test("P13.11761-11880: request rejection disposition permits correction and retry", () => {
  const disposition = createLocalRuntimeRecoveryDisposition({ dispositionId: "DISP-Q", evidence: evidence("REQUEST_REJECTED"), scenario: "MALFORMED_REQUEST" });
  assert.equal(disposition.disposition, "REJECT_AND_CORRECT_REQUEST");
  assert.equal(disposition.retryAllowed, true);
});
