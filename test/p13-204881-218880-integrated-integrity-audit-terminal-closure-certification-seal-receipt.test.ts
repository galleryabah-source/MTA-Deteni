import { strict as assert } from "node:assert";
import { test } from "node:test";
import {
  integratedIntegrityAuditTerminalClosureCertificationSealReceiptCheckpoints,
  createIntegratedIntegrityAuditTerminalClosureCertificationSealReceiptNode,
  replayIntegratedIntegrityAuditTerminalClosureCertificationSealReceiptNode,
  certifyIntegratedIntegrityAuditTerminalClosureCertificationSealReceiptNode,
  resetIntegratedIntegrityAuditTerminalClosureCertificationSealReceiptReplayRegistry,
} from "../src/application/p13-204881-218880-integrated-integrity-audit-terminal-closure-certification-seal-receipt.ts";

const base = {
  artifactId: "artifact-001",
  parentArtifactId: "artifact-parent-001",
  decisionFingerprint: "decision-fp-001",
  closureArtifactId: "artifact-parent-001",
  closureDecisionFingerprint: "closure-fp-001",
  auditArtifactId: "audit-001",
  auditDecisionFingerprint: "decision-fp-001",
  certificationArtifactId: "certification-001",
  certificationDecisionFingerprint: "certification-fp-001",
  sealArtifactId: "seal-001",
  sealDecisionFingerprint: "seal-fp-001",
  receiptArtifactId: "receipt-001",
  receiptDecisionFingerprint: "receipt-fp-001",
};

test("P13.204881-218880 contains exactly 100 unique sequential checkpoints", () => {
  const checkpoints = integratedIntegrityAuditTerminalClosureCertificationSealReceiptCheckpoints();
  assert.equal(checkpoints.length, 100);
  assert.equal(new Set(checkpoints).size, 100);
  assert.equal(checkpoints[0], "P13.204881-205040");
  assert.equal(checkpoints[99], "P13.218741-218880");
  for (let i = 1; i < checkpoints.length; i++) {
    assert.equal(Number(checkpoints[i].match(/P13\.(\d+)-/)?.[1]), 204881 + i * 140);
  }
});

test("receipt layer is immutable, synthetic and review-only", () => {
  const node = createIntegratedIntegrityAuditTerminalClosureCertificationSealReceiptNode({ ...base, checkpoint: "P13.204881-205040" });
  assert.equal(node.state, "TERMINAL_CLOSURE_CERTIFICATION_SEAL_RECEIPT_VERIFIED_FOR_REVIEW");
  assert.equal(Object.isFrozen(node), true);
  assert.equal(node.authorizationGranted, false);
  assert.equal(node.dispatchApproved, false);
  assert.equal(node.externalTransportRequested, false);
  assert.equal(node.dispatchExecuted, false);
  assert.equal(node.durablePublicationCreated, false);
  assert.equal(node.syntheticOnly, true);
});

test("replay is deterministic and fingerprint drift conflicts", () => {
  resetIntegratedIntegrityAuditTerminalClosureCertificationSealReceiptReplayRegistry();
  const node = createIntegratedIntegrityAuditTerminalClosureCertificationSealReceiptNode({ ...base, checkpoint: "P13.207681-207840" });
  assert.equal(replayIntegratedIntegrityAuditTerminalClosureCertificationSealReceiptNode(node), "ADMIT");
  assert.equal(replayIntegratedIntegrityAuditTerminalClosureCertificationSealReceiptNode(node), "REPLAY");
  const drift = { ...node, decisionFingerprint: "decision-fp-drift" };
  assert.equal(replayIntegratedIntegrityAuditTerminalClosureCertificationSealReceiptNode(drift), "CONFLICT");
});

test("certification remains fail-closed and review-only", () => {
  resetIntegratedIntegrityAuditTerminalClosureCertificationSealReceiptReplayRegistry();
  const node = createIntegratedIntegrityAuditTerminalClosureCertificationSealReceiptNode({ ...base, checkpoint: "P13.218741-218880" });
  const certified = certifyIntegratedIntegrityAuditTerminalClosureCertificationSealReceiptNode(node);
  assert.equal(certified.certified, true);
  assert.equal(certified.replayDisposition, "ADMIT");
  assert.equal(certified.syntheticOnly, true);
  assert.equal(certified.dispatchExecuted, false);
});

test("continuity mismatches fail closed", () => {
  assert.throws(() => createIntegratedIntegrityAuditTerminalClosureCertificationSealReceiptNode({ ...base, checkpoint: "P13.204881-205040", closureArtifactId: "wrong-parent" }));
  assert.throws(() => createIntegratedIntegrityAuditTerminalClosureCertificationSealReceiptNode({ ...base, checkpoint: "P13.204881-205040", certificationArtifactId: "audit-001" }));
  assert.throws(() => createIntegratedIntegrityAuditTerminalClosureCertificationSealReceiptNode({ ...base, checkpoint: "P13.204881-205040", sealArtifactId: "certification-001" }));
  assert.throws(() => createIntegratedIntegrityAuditTerminalClosureCertificationSealReceiptNode({ ...base, checkpoint: "P13.204881-205040", receiptArtifactId: "seal-001" }));
  assert.throws(() => createIntegratedIntegrityAuditTerminalClosureCertificationSealReceiptNode({ ...base, checkpoint: "P13.204881-205040", receiptDecisionFingerprint: "decision-fp-001" }));
});
