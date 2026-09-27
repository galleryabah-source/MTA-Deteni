import assert from 'node:assert/strict';

const source = await (await fetch(new URL('../web/mta-state-kernel-v1.js', import.meta.url))).text();

assert.match(source,/syncChain=Promise\.resolve\(\)/);
assert.match(source,/syncChain=syncChain\.then\(\(\)=>syncRemote\(snapshot\)\)/);

console.log('Current contract baseline inspected.');
console.log('Expected hardened contract:');
console.log('1. write/transact MUST return/await a durable remote acknowledgement in production mode.');
console.log('2. A mutation is acknowledged only after remote mutation success.');
console.log('3. Remote mutation failure MUST reject the action; it may not be reported as success.');
console.log('4. Idempotency-Key must remain stable for the logical action/retry.');
console.log('5. Audit must be produced by the same idempotent mutation transaction and be observable before acknowledgement.');
console.log('6. Synthetic mode remains local and governed.');
