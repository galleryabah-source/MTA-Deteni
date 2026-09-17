import assert from "node:assert/strict";
import test from "node:test";
import { getLocalRuntimeFailureMatrix } from "../src/application/local-runtime-failure-recovery-matrix.js";
import { createLocalRuntimeFailureEvidence } from "../src/application/local-runtime-failure-evidence.js";
import { createLocalRuntimeFailureObservation } from "../src/application/local-runtime-failure-observability.js";
import { certifyLocalRuntimeFailure } from "../src/application/local-runtime-failure-certification.js";
import { createLocalRuntimeRecoveryDisposition } from "../src/application/local-runtime-recovery-disposition.js";
import { certifyLocalRuntimeFailureRecoveryJourney } from "../src/application/local-runtime-failure-recovery-journey.js";
import { certifyLocalRuntimeSafetyEnvelope } from "../src/application/local-runtime-safety-certification.js";
import { certifyLocalRuntimeRecovery, assertLocalRuntimeRecoveryCertification } from "../src/application/local-runtime-recovery-certification.js";
import type { LocalRuntimeRequest, LocalRuntimeResponse } from "../src/application/local-runtime-adapter.js";
import type { OperationalSession } from "../src/application/offline-operational-session.js";
import type { RuntimeExecutionContext } from "../src/application/runtime-execution-boundary.js";

const context = { executionId: "EXEC-IC", runtimeMode: "LOCAL", deviceClass: "DESKTOP", networkScopeId: "NET-IC", certificationJourneyId: "J-IC", authenticated: true, syntheticOnly: true } as RuntimeExecutionContext;
const session = { sessionId: "S-IC", executionId: "EXEC-IC", deviceId: "DEV-IC", installationId: "INST-IC", networkScopeId: "NET-IC", runtimeMode: "LOCAL", state: "ACTIVE", syntheticOnly: true } as OperationalSession;
const request = { requestId: "REQ-IC", actorId: "ACT-IC", device: { deviceId: "DEV-IC", installationId: "INST-IC", networkScopeId: "NET-IC", deviceClass: "DESKTOP" }, method: "POST", path: "/mta-local/mutate", headers: {}, idempotencyKey: "IDEMP-IC", boundary: { serviceId: "SVC-IC", listenScope: "LOOPBACK_ONLY", allowsInternetExposure: false, requiresAuthenticatedDevice: true } } as LocalRuntimeRequest;

function makeEnvelope(index: number) {
  const entry = getLocalRuntimeFailureMatrix()[index];
  const evidence = createLocalRuntimeFailureEvidence({ evidenceId: `E-IC-${index}`, failureId: `F-IC-${index}`, failureClass: entry.failureClass, request, response: { requestId: request.requestId, status: "REJECTED", syntheticOnly: true } as LocalRuntimeResponse, session, context, observedAt: "2026-09-16T03:40:00Z" });
  const observation = createLocalRuntimeFailureObservation({ observationId: `O-IC-${index}`, evidence });
  const failure = certifyLocalRuntimeFailure({ certificationId: `C-IC-${index}`, evidence, observation, request });
  const disposition = createLocalRuntimeRecoveryDisposition({ dispositionId: `D-IC-${index}`, evidence, scenario: entry.scenario });
  const journey = certifyLocalRuntimeFailureRecoveryJourney({ journeyId: `J-IC-${index}`, scenario: entry.scenario, evidence, certification: failure, disposition });
  return certifyLocalRuntimeSafetyEnvelope({ envelopeId: `ENV-IC-${index}`, journey, certification: failure, disposition });
}

test("P13.12481-12600: integrated recovery certification preserves the five scenario states", () => {
  const expected = ["READY_FOR_CORRECTION_RETRY", "READY_FOR_REAUTHENTICATION_RETRY", "READY_FOR_SCOPE_REOPEN_RETRY", "OPERATOR_REVIEW_REQUIRED", "RECONCILIATION_REQUIRED"];
  for (let i = 0; i < 5; i += 1) {
    const certification = certifyLocalRuntimeRecovery({ certificationId: `RC-IC-${i}`, envelope: makeEnvelope(i) });
    assert.equal(certification.continuityState, expected[i]);
    assert.equal(certification.syntheticOnly, true);
    assertLocalRuntimeRecoveryCertification(certification);
  }
});

test("P13.12481-12600: blocked certification cannot be mutated into admission", () => {
  const certification = certifyLocalRuntimeRecovery({ certificationId: "RC-BLOCK", envelope: makeEnvelope(4) });
  assert.equal(certification.admitted, false);
  assert.throws(() => assertLocalRuntimeRecoveryCertification({ ...certification, admitted: true } as never), /cannot be admitted|Blocked recovery/i);
});
