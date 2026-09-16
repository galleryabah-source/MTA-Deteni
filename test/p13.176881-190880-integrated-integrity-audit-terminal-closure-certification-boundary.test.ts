import {strict as assert} from "node:assert";
import {test} from "node:test";
import {
  integratedIntegrityAuditTerminalClosureCertificationBoundaryCheckpoints,
  createIntegratedIntegrityAuditTerminalClosureCertificationBoundaryNode,
  replayIntegratedIntegrityAuditTerminalClosureCertificationBoundaryNode,
  certifyIntegratedIntegrityAuditTerminalClosureCertificationBoundaryNode,
  resetIntegratedIntegrityAuditTerminalClosureCertificationBoundaryReplayRegistry,
} from "../src/application/p13-176881-190880-integrated-integrity-audit-terminal-closure-certification-boundary.js";

const base={artifactId:"artifact-001",parentArtifactId:"artifact-parent-001",decisionFingerprint:"decision-fp-001",closureArtifactId:"artifact-parent-001",closureDecisionFingerprint:"closure-fp-001",auditArtifactId:"audit-001",auditDecisionFingerprint:"decision-fp-001",certificationArtifactId:"certification-001",certificationDecisionFingerprint:"certification-fp-001"};

test("P13.176881-190880 contains exactly 100 unique sequential checkpoints",()=>{
  const checkpoints=integratedIntegrityAuditTerminalClosureCertificationBoundaryCheckpoints();
  assert.equal(checkpoints.length,100);
  assert.equal(new Set(checkpoints).size,100);
  assert.equal(checkpoints[0],"P13.176881-177040");
  assert.equal(checkpoints[99],"P13.190741-190880");
  for(let i=1;i<checkpoints.length;i++)assert.equal(Number(checkpoints[i].match(/P13\.(\d+)-/)?.[1]),176881+i*140);
});

test("certification boundary is immutable, synthetic and review-only",()=>{
  const node=createIntegratedIntegrityAuditTerminalClosureCertificationBoundaryNode({...base,checkpoint:"P13.176881-177040"});
  assert.equal(node.state,"TERMINAL_CLOSURE_CERTIFICATION_BOUNDARY_VERIFIED_FOR_REVIEW");
  assert.equal(Object.isFrozen(node),true);
  assert.equal(node.authorizationGranted,false);
  assert.equal(node.dispatchApproved,false);
  assert.equal(node.externalTransportRequested,false);
  assert.equal(node.dispatchExecuted,false);
  assert.equal(node.durablePublicationCreated,false);
  assert.equal(node.syntheticOnly,true);
});

test("replay is deterministic and fingerprint drift conflicts",()=>{
  resetIntegratedIntegrityAuditTerminalClosureCertificationBoundaryReplayRegistry();
  const node=createIntegratedIntegrityAuditTerminalClosureCertificationBoundaryNode({...base,checkpoint:"P13.178001-178160"});
  assert.equal(replayIntegratedIntegrityAuditTerminalClosureCertificationBoundaryNode(node),"ADMIT");
  assert.equal(replayIntegratedIntegrityAuditTerminalClosureCertificationBoundaryNode(node),"REPLAY");
  const drift={...node,decisionFingerprint:"decision-fp-drift"};
  assert.equal(replayIntegratedIntegrityAuditTerminalClosureCertificationBoundaryNode(drift),"CONFLICT");
});

test("certification remains fail-closed and review-only",()=>{
  resetIntegratedIntegrityAuditTerminalClosureCertificationBoundaryReplayRegistry();
  const node=createIntegratedIntegrityAuditTerminalClosureCertificationBoundaryNode({...base,checkpoint:"P13.190741-190880"});
  const certified=certifyIntegratedIntegrityAuditTerminalClosureCertificationBoundaryNode(node);
  assert.equal(certified.certified,true);
  assert.equal(certified.replayDisposition,"ADMIT");
  assert.equal(certified.syntheticOnly,true);
  assert.equal(certified.dispatchExecuted,false);
});

test("continuity mismatches fail closed",()=>{
  assert.throws(()=>createIntegratedIntegrityAuditTerminalClosureCertificationBoundaryNode({...base,checkpoint:"P13.176881-177040",closureArtifactId:"wrong-parent"}));
  assert.throws(()=>createIntegratedIntegrityAuditTerminalClosureCertificationBoundaryNode({...base,checkpoint:"P13.176881-177040",certificationArtifactId:"audit-001"}));
  assert.throws(()=>createIntegratedIntegrityAuditTerminalClosureCertificationBoundaryNode({...base,checkpoint:"P13.176881-177040",certificationDecisionFingerprint:"decision-fp-001"}));
});
