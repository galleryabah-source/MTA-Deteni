import { strict as assert } from "node:assert";
import { test } from "node:test";
import {
  integratedIntegrityAuditTerminalClosureCertificationSealCheckpoints,
  createIntegratedIntegrityAuditTerminalClosureCertificationSealNode,
  replayIntegratedIntegrityAuditTerminalClosureCertificationSealNode,
  certifyIntegratedIntegrityAuditTerminalClosureCertificationSealNode,
  resetIntegratedIntegrityAuditTerminalClosureCertificationSealReplayRegistry,
} from "../src/application/p13-190881-204880-integrated-integrity-audit-terminal-closure-certification-seal.ts";

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
};

test("P13.190881-204880 contains exactly 100 unique sequential checkpoints", () => {
  const checkpoints = integratedIntegrityAuditTerminalClosureCertificationSealCheckpoints();
  assert.equal(checkpoints.length, 100);
  assert.equal(new Set(checkpoints).size, 100);
  assert.equal(checkpoints[0], "P13.190881-191040");
  assert.equal(checkpoints[99], "P13.204741-204880");
  for (let i = 1; i < checkpoints.length; i++) {
    assert.equal(Number(checkpoints[i].match(/P13\.(\d+)-/)?.[1]), 190881 + i * 140);
  }
});

test("certification seal is immutable, synthetic and review-only", () => {
  const node = createIntegratedIntegrityAuditTerminalClosureCertificationSealNode({ ...base, checkpoint: "P13.190881-191040" });
  assert.equal(node.state, "TERMINAL_CLOSURE_CERTIFICATION_SEAL_VERIFIED_FOR_REVIEW");
  assert.equal(Object.isFrozen(node), true);
  assert.equal(node.authorizationGranted, false);
  assert.equal(node.dispatchApproved, false);
  assert.equal(node.externalTransportRequested, false);
  assert.equal(node.dispatchExecuted, false);
  assert.equal(node.durablePublicationCreated, false);
  assert.equal(node.syntheticOnly, true);
});

test("replay is deterministic and fingerprint drift conflicts", () => {
  resetIntegratedIntegrityAuditTerminalClosureCertificationSealReplayRegistry();
  const node = createIntegratedIntegrityAuditTerminalClosureCertificationSealNode({ ...base, checkpoint: "P13.192981-193140" });
  assert.equal(replayIntegratedIntegrityAuditTerminalClosureCertificationSealNode(node), "ADMIT");
  assert.equal(replayIntegratedIntegrityAuditTerminalClosureCertificationSealNode(node), "REPLAY");
  const drift = { ...node, decisionFingerprint: "decision-fp-drift" };
  assert.equal(replayIntegratedIntegrityAuditTerminalClosureCertificationSealNode(drift), "CONFLICT");
});

test("certification remains fail-closed and review-only", () => {
  resetIntegratedIntegrityAuditTerminalClosureCertificationSealReplayRegistry();
  const node = createIntegratedIntegrityAuditTerminalClosureCertificationSealNode({ ...base, checkpoint: "P13.204741-204880" });
  const certified = certifyIntegratedIntegrityAuditTerminalClosureCertificationSealNode(node);
  assert.equal(certified.certified, true);
  assert.equal(certified.replayDisposition, "ADMIT");
  assert.equal(certified.syntheticOnly, true);
  assert.equal(certified.dispatchExecuted, false);
});

test("continuity mismatches fail closed", () => {
  assert.throws(() => createIntegratedIntegrityAuditTerminalClosureCertificationSealNode({ ...base, checkpoint: "P13.190881-191040", closureArtifactId: "wrong-parent" }));
  assert.throws(() => createIntegratedIntegrityAuditTerminalClosureCertificationSealNode({ ...base, checkpoint: "P13.190881-191040", certificationArtifactId: "audit-001" }));
  assert.throws(() => createIntegratedIntegrityAuditTerminalClosureCertificationSealNode({ ...base, checkpoint: "P13.190881-191040", certificationDecisionFingerprint: "decision-fp-001" }));
  assert.throws(() => createIntegratedIntegrityAuditTerminalClosureCertificationSealNode({ ...base, checkpoint: "P13.190881-191040", sealArtifactId: "certification-001" }));
  assert.throws(() => createIntegratedIntegrityAuditTerminalClosureCertificationSealNode({ ...base, checkpoint: "P13.190881-191040", sealDecisionFingerprint: "decision-fp-001" }));
});
