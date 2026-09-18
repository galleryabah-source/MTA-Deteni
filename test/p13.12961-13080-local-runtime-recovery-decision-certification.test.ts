import assert from "node:assert/strict";
import test from "node:test";
import { getLocalRuntimeFailureMatrix } from "../src/application/local-runtime-failure-recovery-matrix.js";
import { createLocalRuntimeFailureEvidence } from "../src/application/local-runtime-failure-evidence.js";
import { createLocalRuntimeFailureObservation } from "../src/application/local-runtime-failure-observability.js";
import { certifyLocalRuntimeFailure } from "../src/application/local-runtime-failure-certification.js";
import { createLocalRuntimeRecoveryDisposition } from "../src/application/local-runtime-recovery-disposition.js";
import { certifyLocalRuntimeFailureRecoveryJourney } from "../src/application/local-runtime-failure-recovery-journey.js";
import { certifyLocalRuntimeSafetyEnvelope } from "../src/application/local-runtime-safety-certification.js";
import { certifyLocalRuntimeRecovery } from "../src/application/local-runtime-recovery-certification.js";
import { createLocalRuntimeRecoveryDecision } from "../src/application/local-runtime-recovery-decision-integrity.js";
import { createLocalRuntimeRecoveryDecisionAuditEvidence } from "../src/application/local-runtime-recovery-decision-audit.js";
import { certifyLocalRuntimeRecoveryDecision, assertLocalRuntimeRecoveryDecisionCertification } from "../src/application/local-runtime-recovery-decision-certification.js";
import type { LocalRuntimeRequest, LocalRuntimeResponse } from "../src/application/local-runtime-adapter.js";
import type { OperationalSession } from "../src/application/offline-operational-session.js";
import type { RuntimeExecutionContext } from "../src/application/runtime-execution-boundary.js";

const context = { executionId: "EXEC-CERT", runtimeMode: "LOCAL", deviceClass: "DESKTOP", networkScopeId: "NET-CERT", certificationJourneyId: "J-CERT", authenticated: true, syntheticOnly: true } as RuntimeExecutionContext;
const session = { sessionId: "S-CERT", executionId: "EXEC-CERT", deviceId: "DEV-CERT", installationId: "INST-CERT", networkScopeId: "NET-CERT", runtimeMode: "LOCAL", state: "ACTIVE", syntheticOnly: true } as OperationalSession;
const request = { requestId: "REQ-CERT", actorId: "ACT-CERT", device: { deviceId: "DEV-CERT", installationId: "INST-CERT", networkScopeId: "NET-CERT", deviceClass: "DESKTOP" }, method: "POST", path: "/mta-local/mutate", headers: {}, idempotencyKey: "IDEMP-CERT", boundary: { serviceId: "SVC-CERT", listenScope: "LOOPBACK_ONLY", allowsInternetExposure: false, requiresAuthenticatedDevice: true } } as LocalRuntimeRequest;

function build(index: number) {
  const entry = getLocalRuntimeFailureMatrix()[index];
  const evidence = createLocalRuntimeFailureEvidence({ evidenceId: `E-CERT-${index}`, failureId: `F-CERT-${index}`, failureClass: entry.failureClass, request, response: { requestId: request.requestId, status: "REJECTED", syntheticOnly: true } as LocalRuntimeResponse, session, context, observedAt: "2026-09-16T04:20:00Z" });
  const observation = createLocalRuntimeFailureObservation({ observationId: `O-CERT-${index}`, evidence });
  const failure = certifyLocalRuntimeFailure({ certificationId: `C-CERT-${index}`, evidence, observation, request });
  const disposition = createLocalRuntimeRecoveryDisposition({ dispositionId: `D-CERT-${index}`, evidence, scenario: entry.scenario });
  const journey = certifyLocalRuntimeFailureRecoveryJourney({ journeyId: `J-CERT-${index}`, scenario: entry.scenario, evidence, certification: failure, disposition });
  const envelope = certifyLocalRuntimeSafetyEnvelope({ envelopeId: `ENV-CERT-${index}`, journey, certification: failure, disposition });
  const recovery = certifyLocalRuntimeRecovery({ certificationId: `RC-CERT-${index}`, envelope });
  const decision = createLocalRuntimeRecoveryDecision({ decisionId: `DEC-CERT-${index}`, envelope });
  const auditEvidence = createLocalRuntimeRecoveryDecisionAuditEvidence({ auditEvidenceId: `AUD-CERT-${index}`, decision, envelope });
  const certification = certifyLocalRuntimeRecoveryDecision({ certificationId: `RDC-CERT-${index}`, decision, recoveryCertification: recovery, auditEvidence, envelope });
  return { envelope, decision, auditEvidence, certification };
}

test("P13.12961-13080: integrated decision certification preserves the five-state recovery matrix", () => {
  const expected = ["READY_FOR_CORRECTION_RETRY", "READY_FOR_REAUTHENTICATION_RETRY", "READY_FOR_SCOPE_REOPEN_RETRY", "OPERATOR_REVIEW_REQUIRED", "RECONCILIATION_REQUIRED"];
  for (let i = 0; i < 5; i += 1) {
    const result = build(i);
    assert.equal(result.certification.continuityState, expected[i]);
    assert.equal(result.certification.syntheticOnly, true);
    assertLocalRuntimeRecoveryDecisionCertification(result.certification, result.decision, result.auditEvidence, result.envelope);
  }
});

test("P13.12961-13080: cross-chain substitution and blocked admission fail closed", () => {
  const first = build(0);
  const second = build(1);
  assert.throws(() => assertLocalRuntimeRecoveryDecisionCertification(first.certification, first.decision, second.auditEvidence, first.envelope), /drift/i);
  assert.throws(() => assertLocalRuntimeRecoveryDecisionCertification({ ...first.certification, action: "OPERATOR_REVIEW" }, first.decision, first.auditEvidence, first.envelope), /drift/i);
  const blocked = build(4);
  assert.equal(blocked.certification.admitted, false);
  assert.throws(() => assertLocalRuntimeRecoveryDecisionCertification(({ ...blocked.certification, admitted: true } as unknown as typeof blocked.certification), blocked.decision, blocked.auditEvidence, blocked.envelope), /drift|cannot be admitted/i);
});
