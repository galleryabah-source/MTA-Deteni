import assert from "node:assert/strict";
import test from "node:test";
import { getLocalRuntimeFailureMatrix } from "../src/application/local-runtime-failure-recovery-matrix.js";
import { createLocalRuntimeFailureEvidence } from "../src/application/local-runtime-failure-evidence.js";
import { createLocalRuntimeFailureObservation } from "../src/application/local-runtime-failure-observability.js";
import { certifyLocalRuntimeFailure } from "../src/application/local-runtime-failure-certification.js";
import { createLocalRuntimeRecoveryDisposition } from "../src/application/local-runtime-recovery-disposition.js";
import { certifyLocalRuntimeFailureRecoveryJourney } from "../src/application/local-runtime-failure-recovery-journey.js";
import { certifyLocalRuntimeSafetyEnvelope } from "../src/application/local-runtime-safety-certification.js";
import { createLocalRuntimeRecoveryDecision } from "../src/application/local-runtime-recovery-decision-integrity.js";
import { createLocalRuntimeRecoveryDecisionAuditEvidence, assertLocalRuntimeRecoveryDecisionAuditEvidence } from "../src/application/local-runtime-recovery-decision-audit.js";
import type { LocalRuntimeRequest, LocalRuntimeResponse } from "../src/application/local-runtime-adapter.js";
import type { OperationalSession } from "../src/application/offline-operational-session.js";
import type { RuntimeExecutionContext } from "../src/application/runtime-execution-boundary.js";

const context = { executionId: "EXEC-AU", runtimeMode: "LOCAL", deviceClass: "DESKTOP", networkScopeId: "NET-AU", certificationJourneyId: "J-AU", authenticated: true, syntheticOnly: true } as RuntimeExecutionContext;
const session = { sessionId: "S-AU", executionId: "EXEC-AU", deviceId: "DEV-AU", installationId: "INST-AU", networkScopeId: "NET-AU", runtimeMode: "LOCAL", state: "ACTIVE", syntheticOnly: true } as OperationalSession;
const request = { requestId: "REQ-AU", actorId: "ACT-AU", device: { deviceId: "DEV-AU", installationId: "INST-AU", networkScopeId: "NET-AU", deviceClass: "DESKTOP" }, method: "POST", path: "/mta-local/mutate", headers: {}, idempotencyKey: "IDEMP-AU", boundary: { serviceId: "SVC-AU", listenScope: "LOOPBACK_ONLY", allowsInternetExposure: false, requiresAuthenticatedDevice: true } } as LocalRuntimeRequest;

function makeEnvelope(index: number) {
  const entry = getLocalRuntimeFailureMatrix()[index];
  const evidence = createLocalRuntimeFailureEvidence({ evidenceId: `E-AU-${index}`, failureId: `F-AU-${index}`, failureClass: entry.failureClass, request, response: { requestId: request.requestId, status: "REJECTED", syntheticOnly: true } as LocalRuntimeResponse, session, context, observedAt: "2026-09-16T04:10:00Z" });
  const observation = createLocalRuntimeFailureObservation({ observationId: `O-AU-${index}`, evidence });
  const failure = certifyLocalRuntimeFailure({ certificationId: `C-AU-${index}`, evidence, observation, request });
  const disposition = createLocalRuntimeRecoveryDisposition({ dispositionId: `D-AU-${index}`, evidence, scenario: entry.scenario });
  const journey = certifyLocalRuntimeFailureRecoveryJourney({ journeyId: `J-AU-${index}`, scenario: entry.scenario, evidence, certification: failure, disposition });
  return certifyLocalRuntimeSafetyEnvelope({ envelopeId: `ENV-AU-${index}`, journey, certification: failure, disposition });
}

test("P13.12841-12960: audit evidence preserves exact decision identity", () => {
  const envelope = makeEnvelope(0);
  const decision = createLocalRuntimeRecoveryDecision({ decisionId: "DEC-AU", envelope });
  const audit = createLocalRuntimeRecoveryDecisionAuditEvidence({ auditEvidenceId: "AUD-AU", decision, envelope });
  assertLocalRuntimeRecoveryDecisionAuditEvidence(audit, decision);
  assert.equal(audit.syntheticOnly, true);
});

test("P13.12841-12960: audit evidence drift fails closed", () => {
  const envelope = makeEnvelope(2);
  const decision = createLocalRuntimeRecoveryDecision({ decisionId: "DEC-AU-DRIFT", envelope });
  const audit = createLocalRuntimeRecoveryDecisionAuditEvidence({ auditEvidenceId: "AUD-AU-DRIFT", decision, envelope });
  assert.throws(() => assertLocalRuntimeRecoveryDecisionAuditEvidence({ ...audit, action: "OPERATOR_REVIEW" }, decision), /audit drift/i);
  assert.throws(() => assertLocalRuntimeRecoveryDecisionAuditEvidence(({ ...audit, syntheticOnly: false } as unknown as typeof audit), decision), /synthetic-only/i);
});
