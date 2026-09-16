import assert from "node:assert/strict";
import test from "node:test";
import { certifyTerminalEvidenceContinuationNode, createTerminalEvidenceContinuationNode, replayTerminalEvidenceContinuationNode, resetTerminalEvidenceContinuationReplayRegistry, terminalEvidenceContinuationCheckpoints } from "../src/application/p13-24881-27560-terminal-evidence-continuation.js";

test("P13.24881-27560: all twenty continuation checkpoints are registered", () => {
  assert.equal(terminalEvidenceContinuationCheckpoints().length, 20);
  assert.equal(terminalEvidenceContinuationCheckpoints()[0], "P13.24881-25040");
  assert.equal(terminalEvidenceContinuationCheckpoints()[19], "P13.27441-27560");
});

test("P13.24881-27560: continuation remains immutable and non-executable", () => {
  const node = createTerminalEvidenceContinuationNode({ checkpoint: "P13.24881-25040", artifactId: "ART-1", parentArtifactId: "ART-0", decisionFingerprint: "FP-1", state: "CLOSED_FOR_REVIEW" });
  assert.equal(node.syntheticOnly, true);
  assert.equal(node.authorizationGranted, false);
  assert.equal(node.dispatchApproved, false);
  assert.equal(node.externalTransportRequested, false);
  assert.equal(node.dispatchExecuted, false);
  assert.equal(node.durablePublicationCreated, false);
});

test("P13.24881-27560: replay is deterministic and fingerprint drift is fail-closed", () => {
  resetTerminalEvidenceContinuationReplayRegistry();
  const node = createTerminalEvidenceContinuationNode({ checkpoint: "P13.25681-25840", artifactId: "ART-2", parentArtifactId: "ART-1", decisionFingerprint: "FP-2", state: "READY_FOR_REVIEW" });
  assert.equal(replayTerminalEvidenceContinuationNode(node), "ADMIT");
  assert.equal(replayTerminalEvidenceContinuationNode(node), "REPLAY");
  assert.equal(replayTerminalEvidenceContinuationNode({ ...node, decisionFingerprint: "DRIFT" }), "CONFLICT");
});

test("P13.24881-27560: certification rejects replay conflict and preserves governance locks", () => {
  resetTerminalEvidenceContinuationReplayRegistry();
  const node = createTerminalEvidenceContinuationNode({ checkpoint: "P13.27441-27560", artifactId: "ART-3", parentArtifactId: "ART-2", decisionFingerprint: "FP-3", state: "VERIFIED_FOR_REVIEW" });
  const certified = certifyTerminalEvidenceContinuationNode(node);
  assert.equal(certified.certified, true);
  assert.equal(certified.replayDisposition, "ADMIT");
  assert.equal(certified.syntheticOnly, true);
  assert.equal(certified.dispatchExecuted, false);
  assert.equal(certified.durablePublicationCreated, false);
});
