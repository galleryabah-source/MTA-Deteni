import assert from "node:assert/strict";
import test from "node:test";
import { createLocalRuntimeRecoveryRuntimeContinuityReceipt } from "../src/application/local-runtime-recovery-runtime-continuity-receipt.js";
import { closeLocalRuntimeRecoveryRuntimeContinuity } from "../src/application/local-runtime-recovery-runtime-continuity-receipt-close.js";
import { createLocalRuntimeRecoveryClosureEvidence } from "../src/application/local-runtime-recovery-closure-evidence.js";
import { certifyLocalRuntimeRecoveryClosure } from "../src/application/local-runtime-recovery-closure-certification.js";
import { createLocalRuntimeRecoveryFinalClosureAuditRecord, assertLocalRuntimeRecoveryFinalClosureAuditRecord } from "../src/application/local-runtime-recovery-final-closure-audit-record.js";
import { replayLocalRuntimeRecoveryFinalClosureAuditRecord, clearLocalRuntimeRecoveryFinalClosureAuditReplayRegistry } from "../src/application/local-runtime-recovery-final-closure-audit-replay.js";
import { certifyLocalRuntimeRecoveryFinalClosureAudit, assertLocalRuntimeRecoveryFinalClosureAuditCertification } from "../src/application/local-runtime-recovery-final-closure-audit-certification.js";
import type { ContinuityCertification } from "../src/application/continuity-certification.js";
import type { IntegratedLocalRuntimeRecoveryExecutionCertification } from "../src/application/integrated-local-runtime-recovery-execution-certification.js";
import type { LocalRuntimeRecoveryExecutionCompletionProof } from "../src/application/local-runtime-recovery-execution-completion-proof.js";
import type { LocalRuntimeRecoveryExecutionAcknowledgement } from "../src/application/local-runtime-recovery-execution-acknowledgement.js";
import type { LocalRuntimeRecoveryExecutionAcknowledgementCertification } from "../src/application/local-runtime-recovery-execution-acknowledgement-certification.js";

const continuity = { certificationId: "CONT-A", journeyId: "J-A", executionId: "EXEC-A", sessionId: "S-A", deviceId: "DEV-A", installationId: "INST-A", networkScopeId: "NET-A", lifecycleJourneyId: "J-A", recoveryJourneyId: "J-A", runtimeDecision: "READY", backupDecision: "READY", projectionVersion: 1, lifecycleVersion: 1, certified: true, syntheticOnly: true } as ContinuityCertification;

function chain(fingerprint = "FP-A") {
  const integrated = { certificationId: "IRC-A", executionId: "EXEC-A", dispatchId: "DISP-A", executionCertificationId: "RX-A", evidenceId: "EXE-A", decisionId: "DEC-A", requestId: "REQ-A", decisionFingerprint: fingerprint, dispatched: true, admitted: true, certified: true, syntheticOnly: true } as IntegratedLocalRuntimeRecoveryExecutionCertification;
  const acknowledgement = { acknowledgementId: "ACK-A", certificationId: "IRC-A", executionId: "EXEC-A", dispatchId: "DISP-A", evidenceId: "EXE-A", decisionId: "DEC-A", requestId: "REQ-A", decisionFingerprint: fingerprint, acknowledged: true, syntheticOnly: true } as LocalRuntimeRecoveryExecutionAcknowledgement;
  const proof = { proofId: "PROOF-A", certificationId: "IRC-A", acknowledgementCertificationId: "ACKC-A", executionId: "EXEC-A", dispatchId: "DISP-A", acknowledgementId: "ACK-A", decisionFingerprint: fingerprint, completed: true, syntheticOnly: true } as LocalRuntimeRecoveryExecutionCompletionProof;
  const ackCertification = { certificationId: "ACKC-A", acknowledgementId: "ACK-A", integratedCertificationId: "IRC-A", executionId: "EXEC-A", dispatchId: "DISP-A", decisionFingerprint: fingerprint, admitted: true, certified: true, syntheticOnly: true } as LocalRuntimeRecoveryExecutionAcknowledgementCertification;
  const receipt = createLocalRuntimeRecoveryRuntimeContinuityReceipt({ receiptId: "RCP-A", continuity, integratedCertification: integrated, completionProof: proof, acknowledgement, acknowledgementCertification: ackCertification });
  const closure = closeLocalRuntimeRecoveryRuntimeContinuity({ closureId: "CLS-A", receipt, continuity, completionProof: proof, acknowledgementCertification: ackCertification });
  const evidence = createLocalRuntimeRecoveryClosureEvidence({ evidenceId: "EVD-A", continuity, integratedCertification: integrated, completionProof: proof, acknowledgement, acknowledgementCertification: ackCertification, receipt, closure });
  const closureCertification = certifyLocalRuntimeRecoveryClosure({ certificationId: "CERT-A", evidence, continuity, integratedCertification: integrated, completionProof: proof, acknowledgement, acknowledgementCertification: ackCertification, receipt, closure });
  return { integrated, acknowledgement, proof, ackCertification, receipt, closure, evidence, closureCertification };
}

test("P13.15001-15120: final closure audit record preserves the complete chain", () => {
  const c = chain();
  const record = createLocalRuntimeRecoveryFinalClosureAuditRecord({ auditRecordId: "AUD-A", certification: c.closureCertification, evidence: c.evidence, continuity, integratedCertification: c.integrated, completionProof: c.proof, acknowledgement: c.acknowledgement, acknowledgementCertification: c.ackCertification, receipt: c.receipt, closure: c.closure });
  assertLocalRuntimeRecoveryFinalClosureAuditRecord({ record, certification: c.closureCertification, evidence: c.evidence });
  assert.equal(record.complete, true);
  assert.equal(record.auditState, "CLOSED");
});

test("P13.15121-15240: final closure audit replay is ADMIT, REPLAY, CONFLICT", () => {
  clearLocalRuntimeRecoveryFinalClosureAuditReplayRegistry();
  const c = chain();
  const record = createLocalRuntimeRecoveryFinalClosureAuditRecord({ auditRecordId: "AUD-R", certification: c.closureCertification, evidence: c.evidence, continuity, integratedCertification: c.integrated, completionProof: c.proof, acknowledgement: c.acknowledgement, acknowledgementCertification: c.ackCertification, receipt: c.receipt, closure: c.closure });
  const args = { record, certification: c.closureCertification, evidence: c.evidence, continuity, integratedCertification: c.integrated, completionProof: c.proof, acknowledgement: c.acknowledgement, acknowledgementCertification: c.ackCertification, receipt: c.receipt, closure: c.closure };
  assert.equal(replayLocalRuntimeRecoveryFinalClosureAuditRecord(args), "ADMIT");
  assert.equal(replayLocalRuntimeRecoveryFinalClosureAuditRecord(args), "REPLAY");
  const drift = chain("FP-DRIFT");
  const driftRecord = createLocalRuntimeRecoveryFinalClosureAuditRecord({ auditRecordId: "AUD-R", certification: drift.closureCertification, evidence: drift.evidence, continuity, integratedCertification: drift.integrated, completionProof: drift.proof, acknowledgement: drift.acknowledgement, acknowledgementCertification: drift.ackCertification, receipt: drift.receipt, closure: drift.closure });
  assert.equal(replayLocalRuntimeRecoveryFinalClosureAuditRecord({ ...args, record: driftRecord, certification: drift.closureCertification, evidence: drift.evidence, integratedCertification: drift.integrated, completionProof: drift.proof, acknowledgement: drift.acknowledgement, acknowledgementCertification: drift.ackCertification, receipt: drift.receipt, closure: drift.closure }), "CONFLICT");
});

test("P13.15241-15360: integrated audit certification rejects identity and conflict drift", () => {
  clearLocalRuntimeRecoveryFinalClosureAuditReplayRegistry();
  const c = chain();
  const record = createLocalRuntimeRecoveryFinalClosureAuditRecord({ auditRecordId: "AUD-C", certification: c.closureCertification, evidence: c.evidence, continuity, integratedCertification: c.integrated, completionProof: c.proof, acknowledgement: c.acknowledgement, acknowledgementCertification: c.ackCertification, receipt: c.receipt, closure: c.closure });
  const input = { certificationId: "AUDCERT-A", record, closureCertification: c.closureCertification, evidence: c.evidence, continuity, integratedCertification: c.integrated, completionProof: c.proof, acknowledgement: c.acknowledgement, acknowledgementCertification: c.ackCertification, receipt: c.receipt, closure: c.closure };
  const certification = certifyLocalRuntimeRecoveryFinalClosureAudit(input);
  assertLocalRuntimeRecoveryFinalClosureAuditCertification(certification, record);
  assert.equal(certification.certified, true);
  assert.throws(() => assertLocalRuntimeRecoveryFinalClosureAuditCertification({ ...certification, decisionFingerprint: "FP-DRIFT" }, record), /drift/i);
  assert.throws(() => certifyLocalRuntimeRecoveryFinalClosureAudit({ ...input, certificationId: "" }), /identity/i);
});
