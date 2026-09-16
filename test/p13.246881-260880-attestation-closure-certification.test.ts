import { strict as assert } from "node:assert";
import { test } from "node:test";
import {
  p13AttestationClosureCertificationCheckpoints,
  createP13AttestationClosureCertificationNode,
  replayP13AttestationClosureCertificationNode,
  certifyP13AttestationClosureCertificationNode,
  resetP13AttestationClosureCertificationReplayRegistry,
} from "../src/application/p13-246881-260880-attestation-closure-certification.ts";

const base = {
  artifactId: "artifact-003",
  parentArtifactId: "artifact-parent-003",
  decisionFingerprint: "decision-fp-003",
  attestationClosureArtifactId: "attestation-closure-003",
  attestationClosureDecisionFingerprint: "attestation-closure-fp-003",
  certificationArtifactId: "certification-003",
  certificationDecisionFingerprint: "certification-fp-003",
};

test("P13.246881-260880 has exactly 100 sequential checkpoints", () => {
  const checkpoints = p13AttestationClosureCertificationCheckpoints();
  assert.equal(checkpoints.length, 100);
  assert.equal(new Set(checkpoints).size, 100);
  assert.equal(checkpoints[0], "P13.246881-247040");
  assert.equal(checkpoints[99], "P13.260741-260880");
  for (let i = 1; i < checkpoints.length; i++) {
    const match = checkpoints[i].match(/^P13\.(\d+)-/);
    assert.ok(match);
    assert.equal(Number(match[1]), 246881 + i * 140);
  }
});

test("certification closure is immutable, synthetic and review-only", () => {
  const node = createP13AttestationClosureCertificationNode({ ...base, checkpoint: "P13.246881-247040" });
  assert.equal(Object.isFrozen(node), true);
  assert.equal(node.syntheticOnly, true);
  assert.equal(node.authorizationGranted, false);
  assert.equal(node.dispatchApproved, false);
  assert.equal(node.externalTransportRequested, false);
  assert.equal(node.dispatchExecuted, false);
  assert.equal(node.durablePublicationCreated, false);
});

test("replay is deterministic and fingerprint drift conflicts", () => {
  resetP13AttestationClosureCertificationReplayRegistry();
  const node = createP13AttestationClosureCertificationNode({ ...base, checkpoint: "P13.253881-254040" });
  assert.equal(replayP13AttestationClosureCertificationNode(node), "ADMIT");
  assert.equal(replayP13AttestationClosureCertificationNode(node), "REPLAY");
  assert.equal(replayP13AttestationClosureCertificationNode({ ...node, decisionFingerprint: "drift" }), "CONFLICT");
});

test("certification fails closed on replay conflict", () => {
  resetP13AttestationClosureCertificationReplayRegistry();
  const node = createP13AttestationClosureCertificationNode({ ...base, checkpoint: "P13.260741-260880" });
  assert.equal(certifyP13AttestationClosureCertificationNode(node).certified, true);
  assert.throws(() => certifyP13AttestationClosureCertificationNode({ ...node, decisionFingerprint: "drift" }));
});

test("identity aliasing fails closed", () => {
  const checkpoint = "P13.246881-247040";
  assert.throws(() => createP13AttestationClosureCertificationNode({ ...base, checkpoint, attestationClosureArtifactId: base.artifactId }));
  assert.throws(() => createP13AttestationClosureCertificationNode({ ...base, checkpoint, attestationClosureArtifactId: base.parentArtifactId }));
  assert.throws(() => createP13AttestationClosureCertificationNode({ ...base, checkpoint, attestationClosureDecisionFingerprint: base.decisionFingerprint }));
  assert.throws(() => createP13AttestationClosureCertificationNode({ ...base, checkpoint, certificationArtifactId: base.artifactId }));
  assert.throws(() => createP13AttestationClosureCertificationNode({ ...base, checkpoint, certificationArtifactId: base.attestationClosureArtifactId }));
  assert.throws(() => createP13AttestationClosureCertificationNode({ ...base, checkpoint, certificationDecisionFingerprint: base.attestationClosureDecisionFingerprint }));
});
