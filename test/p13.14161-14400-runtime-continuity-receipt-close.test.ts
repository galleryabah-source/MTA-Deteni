import assert from "node:assert/strict";
import test from "node:test";
import { closeLocalRuntimeRecoveryRuntimeContinuity } from "../src/application/local-runtime-recovery-runtime-continuity-receipt-close.js";
import { assertLocalRuntimeRecoveryRuntimeContinuityReceipt, createLocalRuntimeRecoveryRuntimeContinuityReceipt } from "../src/application/local-runtime-recovery-runtime-continuity-receipt.js";
import type { ContinuityCertification } from "../src/application/continuity-certification.js";
import type { LocalRuntimeRecoveryExecutionCompletionProof } from "../src/application/local-runtime-recovery-execution-completion-proof.js";
import type { LocalRuntimeRecoveryExecutionAcknowledgementCertification } from "../src/application/local-runtime-recovery-execution-acknowledgement-certification.js";

const continuity = { certificationId: "CONT-1", journeyId: "J-1", executionId: "EXEC-1", sessionId: "S-1", deviceId: "DEV-1", installationId: "INST-1", networkScopeId: "NET-1", lifecycleJourneyId: "J-1", recoveryJourneyId: "J-1", runtimeDecision: "READY", backupDecision: "READY", projectionVersion: 1, lifecycleVersion: 1, certified: true, syntheticOnly: true } as ContinuityCertification;
const proof = { proofId: "PROOF-1", certificationId: "IRC-1", acknowledgementCertificationId: "ACKC-1", executionId: "EXEC-1", dispatchId: "DISP-1", acknowledgementId: "ACK-1", decisionFingerprint: "FP-1", completed: true, syntheticOnly: true } as LocalRuntimeRecoveryExecutionCompletionProof;
const ackCertification = { certificationId: "ACKC-1", acknowledgementId: "ACK-1", integratedCertificationId: "IRC-1", executionId: "EXEC-1", dispatchId: "DISP-1", decisionFingerprint: "FP-1", admitted: true, certified: true, syntheticOnly: true } as LocalRuntimeRecoveryExecutionAcknowledgementCertification;

function receipt() {
  return createLocalRuntimeRecoveryRuntimeContinuityReceipt({ receiptId: "RCP-1", continuity, completionProof: proof, acknowledgementCertification: ackCertification });
}

test("P13.14161-14280: completion proof enters runtime continuity receipt", () => {
  const result = receipt();
  assert.equal(result.continuityState, "READY");
  assert.equal(result.closed, true);
  assertLocalRuntimeRecoveryRuntimeContinuityReceipt(result, continuity, proof, ackCertification);
});

test("P13.14281-14400: continuity closure is fail-closed on unresolved acknowledgement conflict", () => {
  const result = receipt();
  assert.throws(() => closeLocalRuntimeRecoveryRuntimeContinuity({ closureId: "CLS-1", receipt: result, continuity, completionProof: proof, acknowledgementCertification: ackCertification, unresolvedAcknowledgementConflict: true }), /conflict/i);
  const closed = closeLocalRuntimeRecoveryRuntimeContinuity({ closureId: "CLS-2", receipt: result, continuity, completionProof: proof, acknowledgementCertification: ackCertification });
  assert.equal(closed.disposition, "CLOSED");
  assert.equal(closed.closed, true);
});

test("P13.14161-14400: continuity receipt and closure fail closed on identity drift", () => {
  const result = receipt();
  assert.throws(() => assertLocalRuntimeRecoveryRuntimeContinuityReceipt({ ...result, dispatchId: "DRIFT" }, continuity, proof, ackCertification), /drift/i);
  assert.throws(() => closeLocalRuntimeRecoveryRuntimeContinuity({ closureId: "CLS-3", receipt: { ...result, syntheticOnly: false } as never, continuity, completionProof: proof, acknowledgementCertification: ackCertification }), /synthetic-only/i);
});
