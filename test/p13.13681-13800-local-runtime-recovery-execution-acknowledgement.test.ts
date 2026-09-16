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
import { certifyIntegratedLocalRuntimeRecoveryExecution } from "../src/application/integrated-local-runtime-recovery-execution-certification.js";
import { acknowledgeLocalRuntimeRecoveryExecution, assertLocalRuntimeRecoveryExecutionAcknowledgement } from "../src/application/local-runtime-recovery-execution-acknowledgement.js";
import type { LocalRuntimeRequest, LocalRuntimeResponse } from "../src/application/local-runtime-adapter.js";
import type { OperationalSession } from "../src/application/offline-operational-session.js";
import type { RuntimeExecutionContext } from "../src/application/runtime-execution-boundary.js";

const context = { executionId: "EXEC-ACK", runtimeMode: "LOCAL", deviceClass: "DESKTOP", networkScopeId: "NET-ACK", certificationJourneyId: "J-ACK", authenticated: true, syntheticOnly: true } as RuntimeExecutionContext;
const session = { sessionId: "S-ACK", executionId: "EXEC-ACK", deviceId: "DEV-ACK", installationId: "INST-ACK", networkScopeId: "NET-ACK", runtimeMode: "LOCAL", state: "ACTIVE", syntheticOnly: true } as OperationalSession;
const request = { requestId: "REQ-ACK", actorId: "ACT-ACK", device: { deviceId: "DEV-ACK", installationId: "INST-ACK", networkScopeId: "NET-ACK", deviceClass: "DESKTOP" }, method: "POST", path: "/mta-local/mutate", headers: {}, idempotencyKey: "IDEMP-ACK", boundary: { serviceId: "SVC-ACK", listenScope: "LOOPBACK_ONLY", authenticatedDevice: true, internetExposed: false } } as LocalRuntimeRequest;

function build() {
  const entry = getLocalRuntimeFailureMatrix()[0];
  const evidence = createLocalRuntimeFailureEvidence({ evidenceId: "E-ACK", failureId: "F-ACK", failureClass: entry.failureClass, request, response: { requestId: request.requestId, status: "REJECTED", syntheticOnly: true } as LocalRuntimeResponse, session, context, observedAt: "2026-09-16T06:00:00Z" });
  const observation = createLocalRuntimeFailureObservation({ observationId: "O-ACK", evidence });
  const failure = certifyLocalRuntimeFailure({ certificationId: "C-ACK", evidence, observation, request });
  const disposition = createLocalRuntimeRecoveryDisposition({ dispositionId: "D-ACK", evidence, scenario: entry.scenario });
  const journey = certifyLocalRuntimeFailureRecoveryJourney({ journeyId: "J-ACK", scenario: entry.scenario, evidence, certification: failure, disposition });
  const envelope = certifyLocalRuntimeSafetyEnvelope({ envelopeId: "ENV-ACK", journey, certification: failure, disposition });
  const recovery = certifyLocalRuntimeRecovery({ certificationId: "RC-ACK", envelope });
  const decision = createLocalRuntimeRecoveryDecision({ decisionId: "DEC-ACK", envelope });
  const replay = assessLocalRuntimeRecoveryDecisionReplay({ decision, envelope, registry: new Map() });
  const auditEvidence = createLocalRuntimeRecoveryDecisionAuditEvidence({ auditEvidenceId: "AUD-ACK", decision, envelope });
  const decisionCertification = certifyLocalRuntimeRecoveryDecision({ certificationId: "RDC-ACK", decision, recoveryCertification: recovery, auditEvidence, envelope });
  const execution = admitLocalRuntimeRecoveryDecisionExecution({ executionId: context.executionId, request, decision, certification: decisionCertification, replay, auditEvidence, envelope });
  const executionEvidence = createLocalRuntimeRecoveryDecisionExecutionEvidence({ evidenceId: "EXE-ACK", execution, decision, auditEvidence });
  const executionCertification = certifyLocalRuntimeRecoveryExecution({ certificationId: "RX-ACK", execution, executionEvidence, decision, decisionCertification, auditEvidence, request });
  const dispatch = dispatchLocalRuntimeRecoveryExecution({ dispatchId: "DISP-ACK", certification: executionCertification, execution, evidence: executionEvidence, decision });
  const integrated = certifyIntegratedLocalRuntimeRecoveryExecution({ certificationId: "IRC-ACK", execution, evidence: executionEvidence, decision, executionCertification, dispatch });
  return { decision, execution, executionEvidence, executionCertification, dispatch, integrated };
}

test("P13.13681-13800: acknowledgement binds exactly to dispatched execution", () => {
  const result = build();
  const acknowledgement = acknowledgeLocalRuntimeRecoveryExecution({ acknowledgementId: "ACK-001", integratedCertification: result.integrated, executionCertification: result.executionCertification, dispatch: result.dispatch, execution: result.execution, evidence: result.executionEvidence, decision: result.decision });
  assert.equal(acknowledgement.acknowledged, true);
  assert.equal(acknowledgement.dispatchId, result.dispatch.dispatchId);
  assert.equal(acknowledgement.executionId, result.execution.executionId);
  assert.equal(acknowledgement.decisionFingerprint, result.decision.decisionFingerprint);
  assertLocalRuntimeRecoveryExecutionAcknowledgement(acknowledgement, result.integrated, result.executionCertification, result.dispatch, result.execution, result.executionEvidence, result.decision);
});

test("P13.13681-13800: post-dispatch acknowledgement drift fails closed", () => {
  const result = build();
  const acknowledgement = acknowledgeLocalRuntimeRecoveryExecution({ acknowledgementId: "ACK-002", integratedCertification: result.integrated, executionCertification: result.executionCertification, dispatch: result.dispatch, execution: result.execution, evidence: result.executionEvidence, decision: result.decision });
  assert.throws(() => assertLocalRuntimeRecoveryExecutionAcknowledgement({ ...acknowledgement, dispatchId: "DISP-DRIFT" }, result.integrated, result.executionCertification, result.dispatch, result.execution, result.executionEvidence, result.decision), /acknowledgement drift/i);
  assert.throws(() => acknowledgeLocalRuntimeRecoveryExecution({ acknowledgementId: "ACK-DRIFT", integratedCertification: { ...result.integrated, decisionFingerprint: "DRIFT" } as never, executionCertification: result.executionCertification, dispatch: result.dispatch, execution: result.execution, evidence: result.executionEvidence, decision: result.decision }), /fingerprint|drift/i);
  assert.throws(() => assertLocalRuntimeRecoveryExecutionAcknowledgement({ ...acknowledgement, syntheticOnly: false } as never, result.integrated, result.executionCertification, result.dispatch, result.execution, result.executionEvidence, result.decision), /synthetic-only/i);
});
