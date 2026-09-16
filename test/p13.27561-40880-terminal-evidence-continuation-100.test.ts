import { strict as assert } from "node:assert";
import { test } from "node:test";
import { createTerminalEvidenceContinuationANode, replayTerminalEvidenceContinuationANode, certifyTerminalEvidenceContinuationANode, resetTerminalEvidenceContinuationAReplayRegistry, terminalEvidenceContinuationACheckpoints } from "../src/application/p13-27561-30080-terminal-evidence-continuation-a.js";
import { terminalEvidenceContinuationBCheckpoints } from "../src/application/p13-30241-32880-terminal-evidence-continuation-b.js";
import { terminalEvidenceContinuationCCheckpoints } from "../src/application/p13-32881-35560-terminal-evidence-continuation-c.js";
import { terminalEvidenceContinuationDCheckpoints } from "../src/application/p13-35561-38240-terminal-evidence-continuation-d.js";
import { terminalEvidenceContinuationECheckpoints } from "../src/application/p13-38241-40880-terminal-evidence-continuation-e.js";

test("P13.27561-40880 registers exactly 100 sequential continuation checkpoints",()=>{
 const all=[...terminalEvidenceContinuationACheckpoints(),...terminalEvidenceContinuationBCheckpoints(),...terminalEvidenceContinuationCCheckpoints(),...terminalEvidenceContinuationDCheckpoints(),...terminalEvidenceContinuationECheckpoints()];
 assert.equal(all.length,100); assert.equal(new Set(all).size,100); assert.equal(all[0],"P13.27561-27680"); assert.equal(all[99],"P13.40761-40880");
});

test("continuation A preserves review-only governance and deterministic replay",()=>{
 resetTerminalEvidenceContinuationAReplayRegistry();
 const node=createTerminalEvidenceContinuationANode({checkpoint:"P13.27561-27680",artifactId:"artifact-100",parentArtifactId:"artifact-99",decisionFingerprint:"fp-100",state:"VERIFIED_FOR_REVIEW"});
 assert.equal(replayTerminalEvidenceContinuationANode(node),"ADMIT"); assert.equal(replayTerminalEvidenceContinuationANode(node),"REPLAY");
 const conflict={...node,decisionFingerprint:"fp-drift"} as typeof node; assert.equal(replayTerminalEvidenceContinuationANode(conflict),"CONFLICT");
 assert.equal(certifyTerminalEvidenceContinuationANode(node).certified,true);
 assert.equal(node.authorizationGranted,false); assert.equal(node.dispatchApproved,false); assert.equal(node.externalTransportRequested,false); assert.equal(node.dispatchExecuted,false); assert.equal(node.durablePublicationCreated,false); assert.equal(node.syntheticOnly,true);
});
