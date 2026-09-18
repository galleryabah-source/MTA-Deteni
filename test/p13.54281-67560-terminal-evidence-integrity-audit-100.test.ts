import { strict as assert } from "node:assert";
import { test } from "node:test";
import { createTerminalEvidenceIntegrityAuditNode, replayTerminalEvidenceIntegrityAuditNode, certifyTerminalEvidenceIntegrityAuditNode, resetTerminalEvidenceIntegrityAuditReplayRegistry, terminalEvidenceIntegrityAuditCheckpoints } from "../src/application/p13-54281-56960-terminal-evidence-integrity-audit.js";
import { terminalEvidenceIntegrityAuditBCheckpoints } from "../src/application/p13-56961-59520-terminal-evidence-integrity-audit.js";
import { terminalEvidenceIntegrityAuditCCheckpoints } from "../src/application/p13-59521-62080-terminal-evidence-integrity-audit.js";
import { terminalEvidenceIntegrityAuditDCheckpoints } from "../src/application/p13-62241-64800-terminal-evidence-integrity-audit.js";
import { terminalEvidenceIntegrityAuditECheckpoints } from "../src/application/p13-64921-67560-terminal-evidence-integrity-audit.js";

test("P13.54281-67560 registers exactly 100 unique checkpoints",()=>{
 const all=[...terminalEvidenceIntegrityAuditCheckpoints(),...terminalEvidenceIntegrityAuditBCheckpoints(),...terminalEvidenceIntegrityAuditCCheckpoints(),...terminalEvidenceIntegrityAuditDCheckpoints(),...terminalEvidenceIntegrityAuditECheckpoints()];
 assert.equal(all.length,100); assert.equal(new Set(all).size,100); assert.equal(all[0],"P13.54281-54400"); assert.equal(all[99],"P13.67481-67560");
});

test("integrity audit preserves immutable review-only governance and deterministic replay",()=>{
 resetTerminalEvidenceIntegrityAuditReplayRegistry();
 const node=createTerminalEvidenceIntegrityAuditNode({checkpoint:"P13.54281-54400",artifactId:"artifact-201",parentArtifactId:"artifact-200",decisionFingerprint:"fp-201"});
 assert.equal(Object.isFrozen(node),true); assert.equal(node.state,"AUDITED_FOR_REVIEW"); assert.equal(replayTerminalEvidenceIntegrityAuditNode(node),"ADMIT"); assert.equal(replayTerminalEvidenceIntegrityAuditNode(node),"REPLAY");
 const conflict={...node,decisionFingerprint:"fp-drift"} as typeof node; assert.equal(replayTerminalEvidenceIntegrityAuditNode(conflict),"CONFLICT");
 assert.equal(certifyTerminalEvidenceIntegrityAuditNode(node).certified,true);
 assert.equal(node.authorizationGranted,false); assert.equal(node.dispatchApproved,false); assert.equal(node.externalTransportRequested,false); assert.equal(node.dispatchExecuted,false); assert.equal(node.durablePublicationCreated,false); assert.equal(node.syntheticOnly,true);
});
