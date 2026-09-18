import { strict as assert } from "node:assert";
import {
  certifyIntegratedIntegrityAuditTerminalClosureCertificationContinuationNode,
  createIntegratedIntegrityAuditTerminalClosureCertificationContinuationNode,
  integratedIntegrityAuditTerminalClosureCertificationContinuationCheckpoints,
  replayIntegratedIntegrityAuditTerminalClosureCertificationContinuationNode,
  resetIntegratedIntegrityAuditTerminalClosureCertificationContinuationReplayRegistry,
} from "../src/application/p13-176881-190880-integrated-integrity-audit-terminal-closure-certification-continuation.js";

const checkpoints=integratedIntegrityAuditTerminalClosureCertificationContinuationCheckpoints();
assert.equal(checkpoints.length,100);
assert.equal(new Set(checkpoints).size,100);
assert.equal(checkpoints[0],"P13.176881-177040");
assert.equal(checkpoints[99],"P13.190721-190880");

resetIntegratedIntegrityAuditTerminalClosureCertificationContinuationReplayRegistry();
const node=createIntegratedIntegrityAuditTerminalClosureCertificationContinuationNode({
  checkpoint:checkpoints[0],
  artifactId:"artifact-176881",
  parentArtifactId:"closure-parent-176881",
  decisionFingerprint:"decision-current",
  closureArtifactId:"closure-parent-176881",
  closureDecisionFingerprint:"decision-closure",
  auditArtifactId:"audit-176881",
  auditDecisionFingerprint:"decision-current",
  continuityCertificateId:"certificate-176881",
});
assert.equal(Object.isFrozen(node),true);
assert.equal(node.state,"TERMINAL_CLOSURE_CERTIFICATION_CONTINUATION_VERIFIED_FOR_REVIEW");
assert.equal(node.authorizationGranted,false);
assert.equal(node.dispatchApproved,false);
assert.equal(node.externalTransportRequested,false);
assert.equal(node.dispatchExecuted,false);
assert.equal(node.durablePublicationCreated,false);
assert.equal(node.syntheticOnly,true);
assert.equal(replayIntegratedIntegrityAuditTerminalClosureCertificationContinuationNode(node),"ADMIT");
assert.equal(replayIntegratedIntegrityAuditTerminalClosureCertificationContinuationNode(node),"REPLAY");
const certified=certifyIntegratedIntegrityAuditTerminalClosureCertificationContinuationNode(node);
assert.equal(certified.certified,true);
assert.equal(certified.replayDisposition,"REPLAY");

const drift={...node,decisionFingerprint:"decision-drift"};
assert.equal(replayIntegratedIntegrityAuditTerminalClosureCertificationContinuationNode(drift),"CONFLICT");

assert.throws(()=>createIntegratedIntegrityAuditTerminalClosureCertificationContinuationNode({...node,closureArtifactId:"wrong-parent"}));
assert.throws(()=>createIntegratedIntegrityAuditTerminalClosureCertificationContinuationNode({...node,continuityCertificateId:"artifact-176881"}));
assert.throws(()=>createIntegratedIntegrityAuditTerminalClosureCertificationContinuationNode({...node,checkpoint:"P13.999999-1000000"}));
assert.throws(()=>replayIntegratedIntegrityAuditTerminalClosureCertificationContinuationNode({...node,dispatchExecuted:true} as never));
