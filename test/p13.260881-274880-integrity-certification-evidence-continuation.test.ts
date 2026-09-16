import { strict as assert } from "node:assert";
import { test } from "node:test";
import {
  p13IntegrityCertificationEvidenceContinuationCheckpoints,
  createP13IntegrityCertificationEvidenceContinuationNode,
  replayP13IntegrityCertificationEvidenceContinuationNode,
  certifyP13IntegrityCertificationEvidenceContinuationNode,
  resetP13IntegrityCertificationEvidenceContinuationReplayRegistry,
} from "../src/application/p13-260881-274880-integrity-certification-evidence-continuation.js";

const base = {
  artifactId: "artifact-004",
  parentArtifactId: "artifact-parent-004",
  decisionFingerprint: "decision-fp-004",
  certificationArtifactId: "certification-004",
  certificationDecisionFingerprint: "certification-fp-004",
  evidenceArtifactId: "evidence-004",
  evidenceDecisionFingerprint: "evidence-fp-004",
};

test("P13.260881-274880 has exactly 100 sequential checkpoints", () => {
  const checkpoints = p13IntegrityCertificationEvidenceContinuationCheckpoints();
  assert.equal(checkpoints.length, 100);
  assert.equal(new Set(checkpoints).size, 100);
  assert.equal(checkpoints[0], "P13.260881-261040");
  assert.equal(checkpoints[99], "P13.274741-274880");
  for (let i = 1; i < checkpoints.length; i++) {
    const match = checkpoints[i].match(/^P13\.(\d+)-/);
    assert.ok(match);
    assert.equal(Number(match[1]), 260881 + i * 140);
  }
});

test("evidence continuation is immutable, synthetic and review-only", () => {
  const node = createP13IntegrityCertificationEvidenceContinuationNode({ ...base, checkpoint: "P13.260881-261040" });
  assert.equal(Object.isFrozen(node), true);
  assert.equal(node.syntheticOnly, true);
  assert.equal(node.authorizationGranted, false);
  assert.equal(node.dispatchApproved, false);
  assert.equal(node.externalTransportRequested, false);
  assert.equal(node.dispatchExecuted, false);
  assert.equal(node.durablePublicationCreated, false);
});

test("replay is deterministic and fingerprint drift conflicts", () => {
  resetP13IntegrityCertificationEvidenceContinuationReplayRegistry();
  const node = createP13IntegrityCertificationEvidenceContinuationNode({ ...base, checkpoint: "P13.267881-268040" });
  assert.equal(replayP13IntegrityCertificationEvidenceContinuationNode(node), "ADMIT");
  assert.equal(replayP13IntegrityCertificationEvidenceContinuationNode(node), "REPLAY");
  assert.equal(replayP13IntegrityCertificationEvidenceContinuationNode({ ...node, decisionFingerprint: "drift" }), "CONFLICT");
});

test("certification fails closed on replay conflict", () => {
  resetP13IntegrityCertificationEvidenceContinuationReplayRegistry();
  const node = createP13IntegrityCertificationEvidenceContinuationNode({ ...base, checkpoint: "P13.274741-274880" });
  assert.equal(certifyP13IntegrityCertificationEvidenceContinuationNode(node).certified, true);
  assert.throws(() => certifyP13IntegrityCertificationEvidenceContinuationNode({ ...node, decisionFingerprint: "drift" }));
});

test("identity aliasing fails closed", () => {
  const checkpoint = "P13.260881-261040";
  assert.throws(() => createP13IntegrityCertificationEvidenceContinuationNode({ ...base, checkpoint, certificationArtifactId: base.artifactId }));
  assert.throws(() => createP13IntegrityCertificationEvidenceContinuationNode({ ...base, checkpoint, certificationArtifactId: base.parentArtifactId }));
  assert.throws(() => createP13IntegrityCertificationEvidenceContinuationNode({ ...base, checkpoint, evidenceArtifactId: base.artifactId }));
  assert.throws(() => createP13IntegrityCertificationEvidenceContinuationNode({ ...base, checkpoint, evidenceArtifactId: base.certificationArtifactId }));
  assert.throws(() => createP13IntegrityCertificationEvidenceContinuationNode({ ...base, checkpoint, certificationDecisionFingerprint: base.decisionFingerprint }));
  assert.throws(() => createP13IntegrityCertificationEvidenceContinuationNode({ ...base, checkpoint, evidenceDecisionFingerprint: base.certificationDecisionFingerprint }));
});
