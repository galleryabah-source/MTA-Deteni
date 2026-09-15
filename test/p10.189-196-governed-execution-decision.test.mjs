import test from 'node:test';
import assert from 'node:assert/strict';
import { buildGovernedExecutionDecision, assertGovernedExecutionDecision, classifyGovernedExecutionDecision } from '../src/runtime/governed-execution-decision.mjs';
const base=()=>buildGovernedExecutionDecision({decisionId:'synthetic:decision-196',packetId:'synthetic:packet-180'});

test('P10.189 decision schema is explicit',()=>assert.equal(base().schemaVersion,'MTA-GOVERNED-EXECUTION-DECISION-V1'));
test('P10.190 default decision is BLOCKED',()=>assert.equal(classifyGovernedExecutionDecision(base()).classification,'BLOCKED'));
test('P10.191 invalid decision value rejected',()=>assert.equal(classifyGovernedExecutionDecision({...base(),decision:'EXECUTE'}).classification,'BLOCKED'));
test('P10.192 approval requires approver and scope',()=>assert.equal(classifyGovernedExecutionDecision(buildGovernedExecutionDecision({decisionId:'synthetic:d',packetId:'synthetic:p',decision:'APPROVED'})).classification,'BLOCKED'));
test('P10.193 approval requires reason',()=>assert.equal(classifyGovernedExecutionDecision(buildGovernedExecutionDecision({decisionId:'synthetic:d',packetId:'synthetic:p',decision:'APPROVED',approverRef:'synthetic:a',scopeRef:'synthetic:s'})).classification,'BLOCKED'));
test('P10.194 rejected decision is not execution authorization',()=>{const d=buildGovernedExecutionDecision({decisionId:'synthetic:d',packetId:'synthetic:p',decision:'REJECTED',reason:'synthetic rejection'});assert.equal(classifyGovernedExecutionDecision(d).classification,'FAIL');assert.equal(classifyGovernedExecutionDecision(d).executionAuthorized,false);});
test('P10.195 tampering is detected',()=>{const d=base();assert.equal(classifyGovernedExecutionDecision({...d,packetId:'synthetic:other'}).reason,'DECISION_TAMPERED');});
test('P10.196 approved decision remains evidence-only',()=>{const d=buildGovernedExecutionDecision({decisionId:'synthetic:d',packetId:'synthetic:p',decision:'APPROVED',approverRef:'synthetic:a',scopeRef:'synthetic:s',reason:'synthetic governance approval'});assert.equal(assertGovernedExecutionDecision(d),true);assert.equal(classifyGovernedExecutionDecision(d).executionAuthorized,false);});
