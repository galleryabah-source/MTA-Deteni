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
import { admitLocalRuntimeRecoveryDecisionExecution } from "../src/application/local-runtime-recovery-decision-execution.js";
import { createLocalRuntimeRecoveryDecisionExecutionEvidence } from "../src/application/local-runtime-recovery-decision-execution-evidence.js";
import { certifyLocalRuntimeRecoveryExecution } from "../src/application/local-runtime-recovery-execution-certification.js";
import { dispatchLocalRuntimeRecoveryExecution } from "../src/application/local-runtime-recovery-execution-dispatch-gate.js";
import { certifyIntegratedLocalRuntimeRecoveryExecution, assertIntegratedLocalRuntimeRecoveryExecutionCertification } from "../src/application/integrated-local-runtime-recovery-execution-certification.js";
import type { LocalRuntimeRequest, LocalRuntimeResponse } from "../src/application/local-runtime-adapter.js";
import type { OperationalSession } from "../src/application/offline-operational-session.js";
import type { RuntimeExecutionContext } from "../src/application/runtime-execution-boundary.js";

const context = { executionId: "EXEC-CERT", runtimeMode: "LOCAL", deviceClass: "DESKTOP", networkScopeId: "NET-CERT", certificationJourneyId: "J-CERT", authenticated: true, syntheticOnly: true } as RuntimeExecutionContext;
const session = { sessionId: "S-CERT", executionId: "EXEC-CERT", deviceId: "DEV-CERT", installationId: "INST-CERT", networkScopeId: "NET-CERT", runtimeMode: "LOCAL", state: "ACTIVE", syntheticOnly: true } as OperationalSession;
const request = { requestId: "REQ-CERT", actorId: "ACT-CERT", device: { deviceId: "DEV-CERT", installationId: "INST-CERT", networkScopeId: "NET-CERT", deviceClass: "DESKTOP" }, method: "POST", path: "/mta-local/mutate", headers: {}, idempotencyKey: "IDEMP-CERT", boundary: { serviceId: "SVC-CERT", listenScope: "LOOPBACK_ONLY", authenticatedDevice: true, internetExposed: false } } as LocalRuntimeRequest;

function build() {
  const entry = getLocalRuntimeFailureMatrix()[0];
  const evidence = createLocalRuntimeFailureEvidence({ evidenceId: "E-CERT", failureId: "F-CERT", failureClass: entry.failureClass, request, response: { requestId: request.requestId, status: "REJECTED", syntheticOnly: true } as LocalRuntimeResponse, session, context, observedAt: "2026-09-16T05:00:00Z" });
  const observation = createLocalRuntimeFailureObservation({ observationId: "O-CERT", evidence });
  const failure = certifyLocalRuntimeFailure({ certificationId: "C-CERT", evidence, observation, request });
  const disposition = createLocalRuntimeRecoveryDisposition({ dispositionId: "D-CERT", evidence, scenario: entry.scenario });
  const journey = certifyLocalRuntimeFailureRecoveryJourney({ journeyId: "J-CERT", scenario: entry.scenario, evidence, certification: failure, disposition });
  const envelope = certifyLocalRuntimeSafetyEnvelope({ envelopeId: "ENV-CERT", journey, certification: failure, disposition });
  const recovery = certifyLocalRuntimeRecovery({ certificationId: "RC-CERT", envelope });
  const decision = createLocalRuntimeRecoveryDecision({ decisionId: "DEC-CERT", envelope });
  const replay = assessLocalRuntimeRecoveryDecisionReplay({ decision, envelope, registry: new Map() });
  const auditEvidence = createLocalRuntimeRecoveryDecisionAuditEvidence({ auditEvidenceId: "AUD-CERT", decision, envelope });
  const decisionCertification = certifyLocalRuntimeRecoveryDecision({ certificationId: "RDC-CERT", decision, recoveryCertification: recovery, auditEvidence, envelope });
  const execution = admitLocalRuntimeRecoveryDecisionExecution({ executionId: context.executionId, request, decision, certification: decisionCertification, replay, auditEvidence, envelope });
  const executionEvidence = createLocalRuntimeRecoveryDecisionExecutionEvidence({ evidenceId: "EXE-CERT", execution, decision, auditEvidence });
  const executionCertification = certifyLocalRuntimeRecoveryExecution({ certificationId: "RX-CERT", execution, executionEvidence, decision, decisionCertification, auditEvidence, request });
  const dispatch = dispatchLocalRuntimeRecoveryExecution({ dispatchId: "DISP-CERT", certification: executionCertification, execution, evidence: executionEvidence, decision });
  const integrated = certifyIntegratedLocalRuntimeRecoveryExecution({ certificationId: "IRC-CERT", execution, evidence: executionEvidence, decision, executionCertification, dispatch });
  return { decision, execution, executionEvidence, executionCertification, dispatch, integrated };
}

test("P13.13321-13440: execution admission plus evidence reaches final certification", () => {
  const result = build();
  assert.equal(result.execution.admitted, true);
  assert.equal(result.executionEvidence.executionId, result.execution.executionId);
  assert.equal(result.executionCertification.certified, true);
  assert.equal(result.executionCertification.decisionFingerprint, result.decision.decisionFingerprint);
});

test("P13.13441-13560: only certified execution can be dispatched", () => {
  const result = build();
  assert.equal(result.dispatch.dispatched, true);
  assert.throws(() => dispatchLocalRuntimeRecoveryExecution({ dispatchId: "DISP-BLOCK", certification: { ...result.executionCertification, certified: false } as never, execution: result.execution, evidence: result.executionEvidence, decision: result.decision }), /certified|drift/i);
});

test("P13.13561-13680: integrated certification rejects fingerprint and identity drift", () => {
  const result = build();
  assertIntegratedLocalRuntimeRecoveryExecutionCertification(result.integrated, result.executionCertification, result.dispatch, result.execution, result.executionEvidence, result.decision);
  assert.throws(() => certifyIntegratedLocalRuntimeRecoveryExecution({ certificationId: "IRC-DRIFT", execution: result.execution, evidence: result.executionEvidence, decision: { ...result.decision, decisionFingerprint: "DRIFT" } as never, executionCertification: result.executionCertification, dispatch: result.dispatch }), /fingerprint|drift/i);
  assert.throws(() => assertIntegratedLocalRuntimeRecoveryExecutionCertification({ ...result.integrated, requestId: "REQ-DRIFT" }, result.executionCertification, result.dispatch, result.execution, result.executionEvidence, result.decision), /drift/i);
});
