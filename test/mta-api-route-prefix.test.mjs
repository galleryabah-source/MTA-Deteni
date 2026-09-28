import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('mta-api normalizes Supabase Edge Function route prefix before resource dispatch',()=>{
  const source=fs.readFileSync('supabase/functions/mta-api/index.ts','utf8');
  assert.match(source,/const functionIndex=parts\.indexOf\("mta-api"\)/);
  assert.match(source,/const routeParts=functionIndex>=0\?parts\.slice\(functionIndex\+1\):parts/);
  assert.match(source,/const resource=routeParts\[0\],id=routeParts\[1\]/);
  assert.match(source,/TABLES=new Set\(\["detainees","placements","movements","leaves","documents","blocks","rooms","audit","audit-event"\]\)/);
});

test('mta-api route normalization resolves deployed path examples',()=>{
  const resolve=(pathname)=>{
    const parts=pathname.replace(/^\/+|\/+$/g,'').split('/').filter(Boolean);
    const functionIndex=parts.indexOf('mta-api');
    const routeParts=functionIndex>=0?parts.slice(functionIndex+1):parts;
    return [routeParts[0],routeParts[1]];
  };
  assert.deepEqual(resolve('/functions/v1/mta-api/blocks'),['blocks',undefined]);
  assert.deepEqual(resolve('/functions/v1/mta-api/rooms'),['rooms',undefined]);
  assert.deepEqual(resolve('/functions/v1/mta-api/detainees'),['detainees',undefined]);
  assert.deepEqual(resolve('/functions/v1/mta-api/movements'),['movements',undefined]);
  assert.deepEqual(resolve('/functions/v1/mta-api/movements/123'),['movements','123']);
  assert.deepEqual(resolve('/mta-api/audit'),['audit',undefined]);
  assert.deepEqual(resolve('/blocks'),['blocks',undefined]);
});
