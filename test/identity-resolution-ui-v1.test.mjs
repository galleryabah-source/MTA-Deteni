import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const source=fs.readFileSync(new URL('../web/mta-identity-resolution-ui-v1.js',import.meta.url),'utf8');

test('IRUI-001 UI boundary is presentation-only for the Save identity gate',()=>{
  assert.match(source,/IDENTITY INTEGRITY GATE/);
  assert.match(source,/data-ir-decision/);
  assert.doesNotMatch(source,/data-ir-search/);
  assert.doesNotMatch(source,/Cari Riwayat Deteni/);
  assert.doesNotMatch(source,/MTADeteniIdentityResolutionV1\.resolve/);
  assert.doesNotMatch(source,/generateNid/);
  assert.doesNotMatch(source,/createEpisode/);
});

test('IRUI-002 selecting an existing NID blocks new-person submit',()=>{
  assert.match(source,/data-ir-select/);
  assert.match(source,/submit\)submit\.disabled=true/);
  assert.match(source,/Simpan sebagai Deteni baru tetap diblokir/);
});

test('IRUI-003 operator rejection creates an explicit new-person decision',()=>{
  assert.match(source,/decision\.value='NOT_SAME_PERSON'/);
  assert.match(source,/Tekan Simpan kembali/);
});

test('IRUI-004 candidate actions expose data view, existing identity and rejection',()=>{
  assert.match(source,/Lihat Data/);
  assert.match(source,/Gunakan NID Ini/);
  assert.match(source,/Bukan Orang Ini/);
});
