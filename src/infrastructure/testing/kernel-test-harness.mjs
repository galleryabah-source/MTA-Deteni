export const KERNEL_TEST_HARNESS_VERSION='P9.11-IMPLEMENTATION-v1';
export const TEST_CLASSES=Object.freeze(['UNIT','CONTRACT','INTEGRATION','AUTHORIZATION','SECURITY']);
export function createTestEvidence(input){
 if(!TEST_CLASSES.includes(input?.testClass))throw new Error('TEST_CLASS_INVALID');
 for(const k of ['testId','name','result'])if(typeof input?.[k]!=='string'||!input[k])throw new Error('TEST_EVIDENCE_FIELD_REQUIRED:'+k);
 if(!['PASS','FAIL','NOT_RUN'].includes(input.result))throw new Error('TEST_RESULT_INVALID');
 return Object.freeze({version:KERNEL_TEST_HARNESS_VERSION,...input,deterministic:true});
}
export function summarizeEvidence(items){
 if(!Array.isArray(items)||!items.length)throw new Error('TEST_EVIDENCE_EMPTY');
 const counts=Object.fromEntries(['PASS','FAIL','NOT_RUN'].map(x=>[x,items.filter(i=>i.result===x).length]));
 return Object.freeze({total:items.length,...counts,certifiable:counts.FAIL===0&&counts.NOT_RUN===0});
}