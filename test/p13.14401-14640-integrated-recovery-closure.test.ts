import assert from "node:assert/strict";
import test from "node:test";
import { certifyIntegratedLocalRuntimeRecoveryClosure, assertIntegratedLocalRuntimeRecoveryClosureCertification } from "../src/application/integrated-local-runtime-recovery-closure-certification.js";
import { assessLocalRuntimeRecoveryClosureReplay, assertLocalRuntimeRecoveryClosureReplayResult } from "../src/application/local-runtime-recovery-closure-replay-guard.js";
import type { ContinuityCertification } from "../src/application/continuity-certification.js";
import type { LocalRuntimeRecoveryRuntimeContinuityReceipt } from "../src/application/local-runtime-recovery-runtime-continuity-receipt.js";
import type { RuntimeContinuityClosure } from "../src/application/local-runtime-recovery-runtime-continuity-receipt-close.js";
import type { LocalRuntimeRecoveryExecutionCompletionProof } from "../src/application/local-runtime-recovery-execution-completion-proof.js";
import type { LocalRuntimeRecoveryExecutionAcknowledgement } from "../src/application/local-runtime-recovery-execution-acknowledgement.js";
import type { LocalRuntimeRecoveryExecutionAcknowledgementCertification } from "../src/application/local-runtime-recovery-execution-acknowledgement-certification.js";

const continuity = { certificationId: "CONT-1", journeyId: "J-1", executionId: "EXEC-1", sessionId: "S-1", deviceId: "DEV-1", installationId: "INST-1", networkScopeId: "NET-1", lifecycleJourneyId: "J-1", recoveryJourneyId: "J-1", runtimeDecision: "READY", backupDecision: "READY", projectionVersion: 1, lifecycleVersion: 1, certified: true, syntheticOnly: true } as ContinuityCertification;
const receipt = { receiptId: "RCP-1", continuityCertificationId: "CONT-1", completionProofId: "PROOF-1", acknowledgementCertificationId: "ACKC-1", executionId: "EXEC-1", dispatchId: "DISP-1", acknowledgementId: "ACK-1", decisionFingerprint: "FP-1", continuityState: "READY", closed: true, syntheticOnly: true } as LocalRuntimeRecoveryRuntimeContinuityReceipt;
const closure = { closureId: "CLS-1", receiptId: "RCP-1", disposition: "CLOSED", closed: true, syntheticOnly: true } as RuntimeContinuityClosure;
const proof = { proofId: "PROOF-1", certificationId: "IRC-1", acknowledgementCertificationId: "ACKC-1", executionId: "EXEC-1", dispatchId: "DISP-1", acknowledgementId: "ACK-1", decisionFingerprint: "FP-1", completed: true, syntheticOnly: true } as LocalRuntimeRecoveryExecutionCompletionProof;
const acknowledgement = { acknowledgementId: "ACK-1", certificationId: "IRC-1", executionId: "EXEC-1", dispatchId: "DISP-1", evidenceId: "EXE-1", decisionId: "DEC-1", requestId: "REQ-1", decisionFingerprint: "FP-1", acknowledged: true, syntheticOnly: true } as LocalRuntimeRecoveryExecutionAcknowledgement;
const ackCertification = { certificationId: "ACKC-1", acknowledgementId: "ACK-1", integratedCertificationId: "IRC-1", executionId: "EXEC-1", dispatchId: "DISP-1", decisionFingerprint: "FP-1", admitted: true, certified: true, syntheticOnly: true } as LocalRuntimeRecoveryExecutionAcknowledgementCertification;

function certify() { return certifyIntegratedLocalRuntimeRecoveryClosure({ certificationId: "FINAL-1", continuity, receipt, closure, completionProof: proof, acknowledgement, acknowledgementCertification: ackCertification }); }

test("P13.14401-14520: closed continuity becomes integrated closure certification", () => {
  const result = certify();
  assert.equal(result.closed, true); assert.equal(result.certified, true); assert.equal(result.admitted, true);
  assertIntegratedLocalRuntimeRecoveryClosureCertification(result, continuity, receipt, closure, proof, acknowledgement, ackCertification);
});

test("P13.14521-14640: identical closure replays and fingerprint conflict is blocked", () => {
  const result = certify(); const registry = new Map<string, string>();
  const admitted = assessLocalRuntimeRecoveryClosureReplay({ certification: result, continuity, receipt, closure, completionProof: proof, acknowledgement, acknowledgementCertification: ackCertification, registry });
  const replay = assessLocalRuntimeRecoveryClosureReplay({ certification: result, continuity, receipt, closure, completionProof: proof, acknowledgement, acknowledgementCertification: ackCertification, registry });
  assert.equal(admitted.disposition, "ADMIT"); assert.equal(replay.disposition, "REPLAY"); assert.equal(replay.admitted, false); assertLocalRuntimeRecoveryClosureReplayResult(admitted);
  const conflict = assessLocalRuntimeRecoveryClosureReplay({ certification: { ...result, decisionFingerprint: "DRIFT" }, continuity, receipt, closure, completionProof: proof, acknowledgement, acknowledgementCertification: ackCertification, registry });
  assert.equal(conflict.disposition, "CONFLICT"); assert.equal(conflict.admitted, false);
});

test("P13.14401-14640: closure certification fails closed on closure drift", () => {
  assert.throws(() => certifyIntegratedLocalRuntimeRecoveryClosure({ certificationId: "FINAL-2", continuity, receipt, closure: { ...closure, receiptId: "DRIFT" }, completionProof: proof, acknowledgement, acknowledgementCertification: ackCertification }), /drift/i);
  assert.throws(() => assertIntegratedLocalRuntimeRecoveryClosureCertification({ ...certify(), syntheticOnly: false } as never, continuity, receipt, closure, proof, acknowledgement, ackCertification), /synthetic-only/i);
});
