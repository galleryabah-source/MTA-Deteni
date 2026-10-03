import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const source=fs.readFileSync(new URL('../web/mta-identity-resolution-ui-v1.js',import.meta.url),'utf8');

test('IRUI-001 UI boundary is read-only and delegates to canonical resolver',()=>{
  assert.match(source,/MTADeteniIdentityResolutionV1\.resolve/);
  assert.match(source,/READ ONLY/);
  assert.doesNotMatch(source,/generateNid/);
  assert.doesNotMatch(source,/createEpisode/);
});

test('IRUI-002 selecting an existing NID blocks new-person submit',()=>{
  assert.match(source,/selected\.value=candidate\.nid/);
  assert.match(source,/submit\.disabled=true/);
  assert.match(source,/Simpan sebagai Deteni baru diblokir/);
});

test('IRUI-003 no-match preserves canonical new-person path',()=>{
  assert.match(source,/status==='NO_MATCH'/);
  assert.match(source,/Identitas baru tetap menggunakan generator NID canonical/);
});

test('IRUI-004 candidate actions expose history, selection and rejection',()=>{
  assert.match(source,/Lihat Riwayat/);
  assert.match(source,/Pilih NID Ini/);
  assert.match(source,/Bukan Orang Ini/);
});
