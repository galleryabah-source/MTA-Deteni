import assert from "node:assert/strict";
import test from "node:test";
import { createLocalRuntimeRecoveryClosureEvidence, assertLocalRuntimeRecoveryClosureEvidence } from "../src/application/local-runtime-recovery-closure-evidence.js";
import { replayLocalRuntimeRecoveryClosureEvidence, clearLocalRuntimeRecoveryClosureEvidenceReplayRegistry } from "../src/application/local-runtime-recovery-closure-evidence-replay.js";
import { certifyLocalRuntimeRecoveryClosure, assertLocalRuntimeRecoveryClosureCertification } from "../src/application/local-runtime-recovery-closure-certification.js";
import { createLocalRuntimeRecoveryRuntimeContinuityReceipt } from "../src/application/local-runtime-recovery-runtime-continuity-receipt.js";
import { closeLocalRuntimeRecoveryRuntimeContinuity } from "../src/application/local-runtime-recovery-runtime-continuity-receipt-close.js";
import type { ContinuityCertification } from "../src/application/continuity-certification.js";
import type { IntegratedLocalRuntimeRecoveryExecutionCertification } from "../src/application/integrated-local-runtime-recovery-execution-certification.js";
import type { LocalRuntimeRecoveryExecutionCompletionProof } from "../src/application/local-runtime-recovery-execution-completion-proof.js";
import type { LocalRuntimeRecoveryExecutionAcknowledgement } from "../src/application/local-runtime-recovery-execution-acknowledgement.js";
import type { LocalRuntimeRecoveryExecutionAcknowledgementCertification } from "../src/application/local-runtime-recovery-execution-acknowledgement-certification.js";

const continuity = { certificationId: "CONT-F", journeyId: "J-F", executionId: "EXEC-F", sessionId: "S-F", deviceId: "DEV-F", installationId: "INST-F", networkScopeId: "NET-F", lifecycleJourneyId: "J-F", recoveryJourneyId: "J-F", runtimeDecision: "READY", backupDecision: "READY", projectionVersion: 1, lifecycleVersion: 1, certified: true, syntheticOnly: true } as ContinuityCertification;

function chain(fingerprint = "FP-F") {
  const integrated = { certificationId: "IRC-F", executionId: "EXEC-F", dispatchId: "DISP-F", executionCertificationId: "RX-F", evidenceId: "EXE-F", decisionId: "DEC-F", requestId: "REQ-F", decisionFingerprint: fingerprint, dispatched: true, admitted: true, certified: true, syntheticOnly: true } as IntegratedLocalRuntimeRecoveryExecutionCertification;
  const acknowledgement = { acknowledgementId: "ACK-F", certificationId: "IRC-F", executionId: "EXEC-F", dispatchId: "DISP-F", evidenceId: "EXE-F", decisionId: "DEC-F", requestId: "REQ-F", decisionFingerprint: fingerprint, acknowledged: true, syntheticOnly: true } as LocalRuntimeRecoveryExecutionAcknowledgement;
  const proof = { proofId: "PROOF-F", certificationId: "IRC-F", acknowledgementCertificationId: "ACKC-F", executionId: "EXEC-F", dispatchId: "DISP-F", acknowledgementId: "ACK-F", decisionFingerprint: fingerprint, completed: true, syntheticOnly: true } as LocalRuntimeRecoveryExecutionCompletionProof;
  const ackCertification = { certificationId: "ACKC-F", acknowledgementId: "ACK-F", integratedCertificationId: "IRC-F", executionId: "EXEC-F", dispatchId: "DISP-F", decisionFingerprint: fingerprint, admitted: true, certified: true, syntheticOnly: true } as LocalRuntimeRecoveryExecutionAcknowledgementCertification;
  const receipt = createLocalRuntimeRecoveryRuntimeContinuityReceipt({ receiptId: "RCP-F", continuity, integratedCertification: integrated, completionProof: proof, acknowledgement, acknowledgementCertification: ackCertification });
  const closure = closeLocalRuntimeRecoveryRuntimeContinuity({ closureId: "CLS-F", receipt, continuity, completionProof: proof, acknowledgementCertification: ackCertification });
  const evidence = createLocalRuntimeRecoveryClosureEvidence({ evidenceId: "EVD-F", continuity, integratedCertification: integrated, completionProof: proof, acknowledgement, acknowledgementCertification: ackCertification, receipt, closure });
  return { integrated, acknowledgement, proof, ackCertification, receipt, closure, evidence };
}

test("P13.14641-14760: final closure evidence preserves exact identity chain", () => {
  const c = chain();
  assertLocalRuntimeRecoveryClosureEvidence({ evidence: c.evidence, continuity, integratedCertification: c.integrated, completionProof: c.proof, acknowledgement: c.acknowledgement, acknowledgementCertification: c.ackCertification, receipt: c.receipt, closure: c.closure });
  assert.equal(c.evidence.complete, true);
});

test("P13.14761-14880: closure evidence replay is deterministic and conflict-safe", () => {
  clearLocalRuntimeRecoveryClosureEvidenceReplayRegistry();
  const c = chain();
  assert.equal(replayLocalRuntimeRecoveryClosureEvidence({ evidence: c.evidence, continuity, integratedCertification: c.integrated, completionProof: c.proof, acknowledgement: c.acknowledgement, acknowledgementCertification: c.ackCertification, receipt: c.receipt, closure: c.closure }), "ADMIT");
  assert.equal(replayLocalRuntimeRecoveryClosureEvidence({ evidence: c.evidence, continuity, integratedCertification: c.integrated, completionProof: c.proof, acknowledgement: c.acknowledgement, acknowledgementCertification: c.ackCertification, receipt: c.receipt, closure: c.closure }), "REPLAY");
  const drift = chain("FP-DRIFT");
  assert.equal(replayLocalRuntimeRecoveryClosureEvidence({ evidence: drift.evidence, continuity, integratedCertification: drift.integrated, completionProof: drift.proof, acknowledgement: drift.acknowledgement, acknowledgementCertification: drift.ackCertification, receipt: drift.receipt, closure: drift.closure }), "CONFLICT");
});

test("P13.14881-15000: final closure certification is synthetic-only and identity-bound", () => {
  const c = chain();
  const certification = certifyLocalRuntimeRecoveryClosure({ certificationId: "CERT-F", evidence: c.evidence, continuity, integratedCertification: c.integrated, completionProof: c.proof, acknowledgement: c.acknowledgement, acknowledgementCertification: c.ackCertification, receipt: c.receipt, closure: c.closure });
  assertLocalRuntimeRecoveryClosureCertification(certification, c.evidence);
  assert.throws(() => assertLocalRuntimeRecoveryClosureCertification({ ...certification, decisionFingerprint: "FP-DRIFT" }, c.evidence), /drift/i);
  assert.throws(() => certifyLocalRuntimeRecoveryClosure({ certificationId: "", evidence: c.evidence, continuity, integratedCertification: c.integrated, completionProof: c.proof, acknowledgement: c.acknowledgement, acknowledgementCertification: c.ackCertification, receipt: c.receipt, closure: c.closure }), /identity/i);
});
