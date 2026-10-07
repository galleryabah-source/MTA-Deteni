import fs from 'node:fs';
import assert from 'node:assert/strict';
import test from 'node:test';

const shell=fs.readFileSync('web/mta-unified-shell-v2.js','utf8');
const runtime=fs.readFileSync('web/mta-app-runtime-full.js','utf8');

test('QR detainee action preserves personal identity context',()=>{
  assert.match(shell,/function openQrDetaineeDetail\(id\)/);
  assert.match(shell,/detail\.detail\(id\)/);
  assert.match(shell,/window\.show\('detainee-detail',id\)/);
  assert.match(shell,/function openQrDetaineeLeave\(id\)/);
  assert.match(shell,/window\.addLeave\(\)/);
  assert.match(shell,/select\.value=id/);
  assert.match(shell,/\[name="detaineeId"\]/);
  assert.match(shell,/openQrDetaineeLeave\(id\)/);
  assert.match(shell,/openQrDetaineeDetail\(id\)/);
  assert.match(shell,/if\(kind==='detainee'\)\{if\(!openQrDetaineeDetail\(id\)\)/);
});

test('QR personal actions remain on the existing canonical mutation seams',()=>{
  assert.match(shell,/function openMovementForDetainee\(detaineeId\)/);
  assert.match(shell,/p5openMovement/);
  assert.match(runtime,/MTADeteniDomainCommandsV2\.createLeave/);
  assert.match(runtime,/MTADetaineeDetailView/);
});

test('QR action shell cache provenance is current',()=>{
  assert.match(runtime,/mta-unified-shell-v2\.js\?v=15/);
  assert.match(shell,/mta-unified-shell-v2-single-load-ui6/);
});

console.log('QR_PERSONAL_ACTION_CONTEXT: PASS');
