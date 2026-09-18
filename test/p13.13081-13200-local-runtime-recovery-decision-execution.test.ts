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
import { assessLocalRuntimeRecoveryDecisionReplay } from "../src/application/local-runtime-recovery-decision-replay-guard.js";
import { createLocalRuntimeRecoveryDecisionAuditEvidence } from "../src/application/local-runtime-recovery-decision-audit.js";
import { certifyLocalRuntimeRecoveryDecision } from "../src/application/local-runtime-recovery-decision-certification.js";
import { admitLocalRuntimeRecoveryDecisionExecution, assertLocalRuntimeRecoveryDecisionExecution } from "../src/application/local-runtime-recovery-decision-execution.js";
import type { LocalRuntimeRequest, LocalRuntimeResponse } from "../src/application/local-runtime-adapter.js";
import type { OperationalSession } from "../src/application/offline-operational-session.js";
import type { RuntimeExecutionContext } from "../src/application/runtime-execution-boundary.js";

const context = { executionId: "EXEC-EX", runtimeMode: "LOCAL", deviceClass: "DESKTOP", networkScopeId: "NET-EX", certificationJourneyId: "J-EX", authenticated: true, syntheticOnly: true } as RuntimeExecutionContext;
const session = { sessionId: "S-EX", executionId: "EXEC-EX", deviceId: "DEV-EX", installationId: "INST-EX", networkScopeId: "NET-EX", runtimeMode: "LOCAL", state: "ACTIVE", syntheticOnly: true } as OperationalSession;
const request = { requestId: "REQ-EX", actorId: "ACT-EX", device: { deviceId: "DEV-EX", installationId: "INST-EX", networkScopeId: "NET-EX", deviceClass: "DESKTOP" }, method: "POST", path: "/mta-local/mutate", headers: {}, idempotencyKey: "IDEMP-EX", boundary: { serviceId: "SVC-EX", listenScope: "LOOPBACK_ONLY", allowsInternetExposure: false, requiresAuthenticatedDevice: true } } as LocalRuntimeRequest;

function build() {
  const entry = getLocalRuntimeFailureMatrix()[0];
  const evidence = createLocalRuntimeFailureEvidence({ evidenceId: "E-EX", failureId: "F-EX", failureClass: entry.failureClass, request, response: { requestId: request.requestId, status: "REJECTED", syntheticOnly: true } as LocalRuntimeResponse, session, context, observedAt: "2026-09-16T04:40:00Z" });
  const observation = createLocalRuntimeFailureObservation({ observationId: "O-EX", evidence });
  const failure = certifyLocalRuntimeFailure({ certificationId: "C-EX", evidence, observation, request });
  const disposition = createLocalRuntimeRecoveryDisposition({ dispositionId: "D-EX", evidence, scenario: entry.scenario });
  const journey = certifyLocalRuntimeFailureRecoveryJourney({ journeyId: "J-EX", scenario: entry.scenario, evidence, certification: failure, disposition });
  const envelope = certifyLocalRuntimeSafetyEnvelope({ envelopeId: "ENV-EX", journey, certification: failure, disposition });
  const recovery = certifyLocalRuntimeRecovery({ certificationId: "RC-EX", envelope });
  const decision = createLocalRuntimeRecoveryDecision({ decisionId: "DEC-EX", envelope });
  const replay = assessLocalRuntimeRecoveryDecisionReplay({ decision, envelope, registry: new Map() });
  const auditEvidence = createLocalRuntimeRecoveryDecisionAuditEvidence({ auditEvidenceId: "AUD-EX", decision, envelope });
  const certification = certifyLocalRuntimeRecoveryDecision({ certificationId: "RDC-EX", decision, recoveryCertification: recovery, auditEvidence, envelope });
  return { envelope, decision, replay, auditEvidence, certification };
}

test("P13.13081-13200: only an exact admitted recovery decision reaches execution", () => {
  const result = build();
  const execution = admitLocalRuntimeRecoveryDecisionExecution({ executionId: "RUN-EX", request, decision: result.decision, certification: result.certification, replay: result.replay, auditEvidence: result.auditEvidence, envelope: result.envelope });
  assertLocalRuntimeRecoveryDecisionExecution(execution);
  assert.equal(execution.admitted, true);
  assert.equal(execution.syntheticOnly, true);
});

test("P13.13081-13200: conflicted or blocked decisions cannot execute", () => {
  const result = build();
  assert.throws(() => admitLocalRuntimeRecoveryDecisionExecution({ executionId: "RUN-CONFLICT", request, decision: result.decision, certification: result.certification, replay: { ...result.replay, disposition: "CONFLICT", admitted: false }, auditEvidence: result.auditEvidence, envelope: result.envelope }), /requires an admitted|drift/i);
  assert.throws(() => assertLocalRuntimeRecoveryDecisionExecution({ ...({ executionId: "RUN-BLOCK", decisionId: "DEC", requestId: "REQ", certificationId: "CERT", auditEvidenceId: "AUD", envelopeId: "ENV", admitted: false, syntheticOnly: true } as unknown as typeof execution } as const) }), /admitted/i);
});
