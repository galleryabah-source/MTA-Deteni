import { strict as assert } from "node:assert";
import { test } from "node:test";
import { createTerminalEvidenceContinuationFNode, replayTerminalEvidenceContinuationFNode, certifyTerminalEvidenceContinuationFNode, resetTerminalEvidenceContinuationFReplayRegistry, terminalEvidenceContinuationFCheckpoints } from "../src/application/p13-40881-43560-terminal-evidence-continuation-f.js";
import { terminalEvidenceContinuationGCheckpoints } from "../src/application/p13-43561-46240-terminal-evidence-continuation-g.js";
import { terminalEvidenceContinuationHCheckpoints } from "../src/application/p13-46241-48920-terminal-evidence-continuation-h.js";
import { terminalEvidenceContinuationICheckpoints } from "../src/application/p13-48921-51600-terminal-evidence-continuation-i.js";
import { terminalEvidenceContinuationJCheckpoints } from "../src/application/p13-51601-54280-terminal-evidence-continuation-j.js";

test("P13.40881-54280 registers exactly 100 unique sequential checkpoints",()=>{
 const all=[...terminalEvidenceContinuationFCheckpoints(),...terminalEvidenceContinuationGCheckpoints(),...terminalEvidenceContinuationHCheckpoints(),...terminalEvidenceContinuationICheckpoints(),...terminalEvidenceContinuationJCheckpoints()];
 assert.equal(all.length,100); assert.equal(new Set(all).size,100); assert.equal(all[0],"P13.40881-41040"); assert.equal(all[99],"P13.54161-54280");
});

test("continuation F preserves immutable review-only governance and replay determinism",()=>{
 resetTerminalEvidenceContinuationFReplayRegistry();
 const node=createTerminalEvidenceContinuationFNode({checkpoint:"P13.40881-41040",artifactId:"artifact-101",parentArtifactId:"artifact-100",decisionFingerprint:"fp-101",state:"VERIFIED_FOR_REVIEW"});
 assert.equal(Object.isFrozen(node),true); assert.equal(replayTerminalEvidenceContinuationFNode(node),"ADMIT"); assert.equal(replayTerminalEvidenceContinuationFNode(node),"REPLAY");
 const conflict={...node,decisionFingerprint:"fp-drift"} as typeof node; assert.equal(replayTerminalEvidenceContinuationFNode(conflict),"CONFLICT");
 assert.equal(certifyTerminalEvidenceContinuationFNode(node).certified,true);
 assert.equal(node.authorizationGranted,false); assert.equal(node.dispatchApproved,false); assert.equal(node.externalTransportRequested,false); assert.equal(node.dispatchExecuted,false); assert.equal(node.durablePublicationCreated,false); assert.equal(node.syntheticOnly,true);
});
