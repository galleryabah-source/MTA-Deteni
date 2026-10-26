import { strict as assert } from "node:assert";
import fs from "node:fs";
import { evaluateSyntheticE2E } from "../src/application/p11-289-352-synthetic-e2e.js";
import { evaluateCrossDomainComposition } from "../src/application/p11-545-608-cross-domain-composition.js";

const preview5=fs.readFileSync("web/preview-v5.js","utf8");
const movement=fs.readFileSync("web/movement-v9.js","utf8");
const preview6=fs.readFileSync("web/preview-v6.js","utf8");

assert.match(preview5,/window.p5resolve/);
assert.match(preview5,/window.p5openDetainee/);
assert.match(preview5,/window.p5openMovement/);
assert.match(preview5,/window.p5return/);
assert.match(preview5,/LEAVE_RETURN_CONFIRM/);
assert.match(movement,/MOVEMENT_CREATED/);
assert.match(movement,/MOVEMENT_CREATE/);
assert.match(movement,/PLACEMENT_ASSIGN/);
assert.match(preview6,/ROOM_QR_STATE_CHANGED/);
assert.match(preview6,/LEAVE_QR_ISSUED/);

const contract={contractId:"F3-E2E-001",target:"SYNTHETIC",observations:[
 {checkpoint:"F3-DEPARTURE",detaineeId:"SYN-D-001",placement:"EXITED",headcount:9,qrContext:"TEMPORARY_EXIT",qrValidity:"ACTIVE"},
 {checkpoint:"F3-RETURN",detaineeId:"SYN-D-001",placement:"RETURNED",headcount:10,qrContext:"RUDENIM_STAY",qrValidity:"ACTIVE"}
]};
const run={runId:"F3-RUN-001",target:"SYNTHETIC",steps:[
 {checkpoint:"F3-DEPARTURE",name:"temporary-exit-departure",status:"PASS"},
 {checkpoint:"F3-RETURN",name:"temporary-exit-return",status:"PASS"}
]};
assert.equal(evaluateSyntheticE2E(contract,run),"READY");

const aggregate={contractId:"F3-XDOM-001",target:"SYNTHETIC",aggregates:[
 {detaineeId:"SYN-D-001",detaineeStatus:"ACTIVE",placementId:"ROOM-A",placementState:"RETURNED",headcountIncluded:true}
],reconciliation:{contractId:"F3-RECON-001",target:"SYNTHETIC",observations:[
 {checkpoint:"F3-RETURN",detaineeId:"SYN-D-001",placement:{detaineeId:"SYN-D-001",placementId:"ROOM-A",state:"RETURNED"},movementEvents:[{eventId:"MOV-F3-001",detaineeId:"SYN-D-001",fromPlacementId:null,toPlacementId:"ROOM-A",kind:"TEMPORARY_EXIT_RETURN",headcountDelta:1}],expectedHeadcount:10,observedHeadcount:10}
]}};
assert.equal(evaluateCrossDomainComposition(aggregate),"READY");

assert.equal(evaluateSyntheticE2E(contract,{...run,steps:[{...run.steps[0],status:"FAIL"},run.steps[1]]}),"BLOCKED");
assert.equal(evaluateCrossDomainComposition({...aggregate,aggregates:[{...aggregate.aggregates[0],headcountIncluded:false}]}),"BLOCKED");

console.log("F3_CROSS_ACTION_CLOSURE_GATE PASS");
