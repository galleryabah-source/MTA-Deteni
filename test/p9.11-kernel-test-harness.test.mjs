import assert from 'node:assert/strict';
import test from 'node:test';
import {createTestEvidence,summarizeEvidence} from '../src/infrastructure/testing/kernel-test-harness.mjs';

test('P9.11 accepts controlled test classes',()=>{
 const evidence=createTestEvidence({testClass:'SECURITY',testId:'T1',name:'secret-boundary',result:'PASS'});
 assert.equal(evidence.deterministic,true);
});
test('P9.11 rejects unknown classes',()=>{
 assert.throws(()=>createTestEvidence({testClass:'RANDOM',testId:'T1',name:'x',result:'PASS'}),/TEST_CLASS_INVALID/);
});
test('P9.11 summarizes certification evidence',()=>{
 assert.equal(summarizeEvidence([{result:'PASS'},{result:'PASS'}]).certifiable,true);
});
test('P9.11 blocks certification on NOT_RUN',()=>{
 assert.equal(summarizeEvidence([{result:'PASS'},{result:'NOT_RUN'}]).certifiable,false);
});
