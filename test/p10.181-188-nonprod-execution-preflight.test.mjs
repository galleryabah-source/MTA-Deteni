import test from 'node:test';
import assert from 'node:assert/strict';
import { buildExecutionPreflight, assertExecutionPreflight, classifyExecutionPreflight } from '../src/runtime/nonprod-execution-preflight.mjs';

const valid = () => buildExecutionPreflight({packetId:'synthetic:packet-180',checkpoint:'P10.188',packetStatus:'VALIDATED',governanceApproved:true,targetApproved:true,migrationFreeze:false,aiEnabled:false,rollbackReady:true,independentReviewComplete:true});

test('P10.181 preflight schema is bounded',()=>{ const p=valid(); assert.equal(p.schemaVersion,'MTA-NONPROD-PREFLIGHT-V1'); assert.equal(p.executionAuthorized,undefined); });
test('P10.182 packet must already be validated',()=>{ const p=valid(); p.packetStatus='BLOCKED'; assert.equal(classifyExecutionPreflight(p).reason,'PREFLIGHT_PACKET_NOT_VALIDATED'); });
test('P10.183 Migration Freeze blocks preflight',()=>{ const p=valid(); p.migrationFreeze=true; assert.equal(classifyExecutionPreflight(p).reason,'PREFLIGHT_SAFETY_GATE_FAILED'); });
test('P10.184 governance approval is explicit',()=>{ const p=valid(); p.governanceApproved=false; assert.equal(classifyExecutionPreflight(p).reason,'PREFLIGHT_GOVERNANCE_REQUIRED'); });
test('P10.185 target approval is independent',()=>{ const p=valid(); p.targetApproved=false; assert.equal(classifyExecutionPreflight(p).reason,'PREFLIGHT_TARGET_REQUIRED'); });
test('P10.186 rollback readiness is mandatory',()=>{ const p=valid(); p.rollbackReady=false; assert.equal(classifyExecutionPreflight(p).reason,'PREFLIGHT_ROLLBACK_NOT_READY'); });
test('P10.187 independent review is mandatory',()=>{ const p=valid(); p.independentReviewComplete=false; assert.equal(classifyExecutionPreflight(p).reason,'PREFLIGHT_INDEPENDENT_REVIEW_REQUIRED'); });
test('P10.188 even a valid preflight never authorizes execution',()=>{ const p=valid(); assert.equal(assertExecutionPreflight(p),true); const c=classifyExecutionPreflight(p); assert.equal(c.classification,'PASS'); assert.equal(c.executionAuthorized,false); });
