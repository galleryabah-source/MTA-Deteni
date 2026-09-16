import assert from "node:assert/strict";
import test from "node:test";
import { getLocalRuntimeFailureMatrix, assertLocalRuntimeFailureMatrixCase } from "../src/application/local-runtime-failure-recovery-matrix.js";
import { createLocalRuntimeFailureEvidence } from "../src/application/local-runtime-failure-evidence.js";
import { createLocalRuntimeFailureObservation } from "../src/application/local-runtime-failure-observability.js";
import { certifyLocalRuntimeFailure } from "../src/application/local-runtime-failure-certification.js";
import { createLocalRuntimeRecoveryDisposition } from "../src/application/local-runtime-recovery-disposition.js";
import { certifyLocalRuntimeFailureRecoveryJourney } from "../src/application/local-runtime-failure-recovery-journey.js";
import { assertLocalRuntimeSafetyEnvelope, certifyLocalRuntimeSafetyEnvelope } from "../src/application/local-runtime-safety-certification.js";
import type { LocalRuntimeRequest, LocalRuntimeResponse } from "../src/application/local-runtime-adapter.js";
import type { OperationalSession } from "../src/application/offline-operational-session.js";
import type { RuntimeExecutionContext } from "../src/application/runtime-execution-boundary.js";

const context = { executionId: "EXEC-M", runtimeMode: "LOCAL", deviceClass: "DESKTOP", networkScopeId: "NET-M", certificationJourneyId: "J-M", authenticated: true, syntheticOnly: true } as RuntimeExecutionContext;
const session = { sessionId: "S-M", executionId: "EXEC-M", deviceId: "DEV-M", installationId: "INST-M", networkScopeId: "NET-M", runtimeMode: "LOCAL", state: "ACTIVE", syntheticOnly: true } as OperationalSession;
const request = { requestId: "REQ-M", actorId: "ACT-M", device: { deviceId: "DEV-M", installationId: "INST-M", networkScopeId: "NET-M", deviceClass: "DESKTOP" }, method: "POST", path: "/mta-local/mutate", headers: {}, idempotencyKey: "IDEMP-M", boundary: { serviceId: "SVC-M", listenScope: "LOOPBACK_ONLY", authenticatedDevice: true, internetExposed: false } } as LocalRuntimeRequest;

function runScenario(entry: ReturnType<typeof getLocalRuntimeFailureMatrix>[number], suffix: string) {
  const evidence = createLocalRuntimeFailureEvidence({ evidenceId: `E-${suffix}`, failureId: `FAIL-${suffix}`, failureClass: entry.failureClass, request, response: { requestId: request.requestId, status: "REJECTED", syntheticOnly: true } as LocalRuntimeResponse, session, context, observedAt: "2026-09-16T03:00:00Z" });
  const observation = createLocalRuntimeFailureObservation({ observationId: `OBS-${suffix}`, evidence });
  const certification = certifyLocalRuntimeFailure({ certificationId: `CERT-${suffix}`, evidence, observation, request });
  const disposition = createLocalRuntimeRecoveryDisposition({ dispositionId: `DISP-${suffix}`, evidence, scenario: entry.scenario });
  const journey = certifyLocalRuntimeFailureRecoveryJourney({ journeyId: `JOURNEY-${suffix}`, scenario: entry.scenario, evidence, certification, disposition });
  const envelope = certifyLocalRuntimeSafetyEnvelope({ envelopeId: `ENV-${suffix}`, journey, certification, disposition });
  assertLocalRuntimeSafetyEnvelope(envelope);
  return { evidence, disposition, journey, envelope };
}

test("P13.12121-12240: all five failure scenarios traverse the complete safety chain", () => {
  const matrix = getLocalRuntimeFailureMatrix();
  assert.equal(matrix.length, 5);
  for (const entry of matrix) {
    assertLocalRuntimeFailureMatrixCase(entry);
    const result = runScenario(entry, entry.scenario);
    assert.equal(result.evidence.responseStatus, "REJECTED");
    assert.equal(result.envelope.scenario, entry.scenario);
    assert.equal(result.envelope.disposition, entry.disposition);
    assert.equal(result.envelope.safeToRetry, entry.retryAllowed);
    assert.equal(result.envelope.operatorReviewRequired, entry.requiresOperatorReview);
    assert.equal(result.envelope.syntheticOnly, true);
  }
});

test("P13.12121-12240: retry policy drift fails closed", () => {
  const result = runScenario(getLocalRuntimeFailureMatrix()[3], "DRIFT");
  assert.throws(() => assertLocalRuntimeSafetyEnvelope({ ...result.envelope, safeToRetry: true }), /automatic retry|operator review/i);
});

test("P13.12121-12240: operator-review drift fails closed", () => {
  const result = runScenario(getLocalRuntimeFailureMatrix()[3], "REVIEW");
  assert.throws(() => assertLocalRuntimeSafetyEnvelope({ ...result.envelope, operatorReviewRequired: false }), /synthetic|automatic retry|safety envelope/i);
});

test("P13.12121-12240: non-synthetic certification input is rejected", () => {
  const result = runScenario(getLocalRuntimeFailureMatrix()[3], "SYNTH");
  assert.throws(() => assertLocalRuntimeSafetyEnvelope({ ...result.envelope, syntheticOnly: false }), /synthetic-only|certified/i);
});
