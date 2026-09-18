import assert from "node:assert/strict";
import test from "node:test";
import { createLocalRuntimeRecoveryDecisionExecutionEvidence, assertLocalRuntimeRecoveryDecisionExecutionEvidence } from "../src/application/local-runtime-recovery-decision-execution-evidence.js";
import { admitLocalRuntimeRecoveryDecisionExecution } from "../src/application/local-runtime-recovery-decision-execution.js";
import type { LocalRuntimeRecoveryDecision } from "../src/application/local-runtime-recovery-decision-integrity.js";
import type { LocalRuntimeRecoveryDecisionAuditEvidence } from "../src/application/local-runtime-recovery-decision-audit.js";
import type { LocalRuntimeRequest } from "../src/application/local-runtime-adapter.js";

const request = { requestId: "REQ-EV", actorId: "ACT-EV", device: { deviceId: "DEV-EV", installationId: "INST-EV", networkScopeId: "NET-EV", deviceClass: "DESKTOP" }, method: "POST", path: "/mta-local/mutate", headers: {}, idempotencyKey: "IDEMP-EV", boundary: { serviceId: "SVC-EV", listenScope: "LOOPBACK_ONLY", allowsInternetExposure: false, requiresAuthenticatedDevice: true } } as LocalRuntimeRequest;
const decision = { decisionId: "DEC-EV", envelopeId: "ENV-EV", journeyId: "J-EV", certificationId: "C-EV", evidenceId: "E-EV", dispositionId: "D-EV", scenario: "MALFORMED_REQUEST", disposition: "REJECT_AND_CORRECT_REQUEST", continuityState: "READY_FOR_CORRECTION_RETRY", action: "RETRY_AFTER_CORRECTION", admitted: true, decisionFingerprint: "FP-EV", certified: true, syntheticOnly: true } as LocalRuntimeRecoveryDecision;
const audit = { auditEvidenceId: "AUD-EV", decisionId: decision.decisionId, envelopeId: decision.envelopeId, journeyId: decision.journeyId, certificationId: decision.certificationId, evidenceId: decision.evidenceId, dispositionId: decision.dispositionId, scenario: decision.scenario, action: decision.action, admitted: true, decisionFingerprint: decision.decisionFingerprint, syntheticOnly: true } as LocalRuntimeRecoveryDecisionAuditEvidence;
const execution = { executionId: "RUN-EV", decisionId: decision.decisionId, requestId: request.requestId, certificationId: decision.certificationId, auditEvidenceId: audit.auditEvidenceId, envelopeId: decision.envelopeId, admitted: true, syntheticOnly: true } as const;

test("P13.13201-13320: execution evidence preserves decision and runtime identities", () => {
  const evidence = createLocalRuntimeRecoveryDecisionExecutionEvidence({ evidenceId: "EXE-EV", execution, decision, auditEvidence: audit });
  assertLocalRuntimeRecoveryDecisionExecutionEvidence(evidence, execution, decision);
  assert.equal(evidence.syntheticOnly, true);
});

test("P13.13201-13320: execution evidence tampering fails closed", () => {
  const evidence = createLocalRuntimeRecoveryDecisionExecutionEvidence({ evidenceId: "EXE-EV-DRIFT", execution, decision, auditEvidence: audit });
  assert.throws(() => assertLocalRuntimeRecoveryDecisionExecutionEvidence({ ...evidence, decisionFingerprint: "tampered" }, execution, decision), /evidence drift/i);
  assert.throws(() => assertLocalRuntimeRecoveryDecisionExecutionEvidence({ ...evidence, syntheticOnly: false } as never, execution, decision), /synthetic-only/i);
});
