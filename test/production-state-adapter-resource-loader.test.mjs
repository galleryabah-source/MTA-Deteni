import fs from 'node:fs';
import assert from 'node:assert/strict';

const source=fs.readFileSync('web/mta-production-state-adapter-v1.js','utf8');

assert.match(source,/const sessionToken=await session\(\);/);
assert.match(source,/const me=await request\('me',\{sessionOverride:sessionToken\}\);/);
assert.match(source,/Promise\.all\(resources\.map\(resource=>request\(resource,\{sessionOverride:sessionToken\}\)\)\)/);
assert.match(source,/adminConfig=await request\('admin-config',\{sessionOverride:sessionToken\}\)/);
assert.match(source,/role:String\(me\.role\|\|me\.profile\?\.role\|\|''\)\.toUpperCase\(\)/);
assert.match(source,/error\?\.status!==403&&error\?\.status!==404&&error\?\.status!==409/);
assert.doesNotMatch(source,/\.map\(list\)/);
assert.match(source,/async function request\(resource/);
assert.match(source,/REQUEST_TIMEOUT_MS=10000/);
assert.match(source,/withTimeout\(fetch\(path,init\(\)\)\)/);
console.log('Production state adapter resource loader contract: PASS');
