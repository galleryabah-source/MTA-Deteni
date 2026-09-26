import fs from 'node:fs';
import assert from 'node:assert/strict';
import test from 'node:test';

const detail=fs.readFileSync('web/detainee-detail-v1.js','utf8');
const core=fs.readFileSync('web/mta-app-runtime-full.js','utf8');
const admin=fs.readFileSync('web/admin-settings-v9.js','utf8');

test('Data Deteni UI exposes Tambah Deteni and delegates to canonical CRUD owner',()=>{
  assert.match(detail,/id="ddAdd"/);
  assert.match(detail,/window\.addDetainee\(\)/);
  assert.doesNotMatch(detail,/window\.addDetainee\s*=|window\.addDetainee\s*=/);
  assert.match(core,/function addDetainee\(existing\)/);
  assert.match(core,/window\.MTA_DETAINEE_CRUD_OWNER='CORE_RUNTIME_V2'/);
  assert.match(admin,/Detainee CRUD ownership belongs exclusively to the core runtime/);
});
