import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const source=fs.readFileSync(new URL('../web/mta-unified-shell-v2.js',import.meta.url),'utf8');

test('Phase 10 render health defers deep final integrity certification',()=>{
  const start=source.indexOf('function renderHealth(){');
  const end=source.indexOf('\nfunction syncLegacyDb',start);
  assert.ok(start>=0&&end>start,'renderHealth contract must exist');
  const block=source.slice(start,end);
  assert.match(block,/setTimeout\(\(\)=>\{/,'deep integrity gate must be deferred');
  assert.match(block,/finalIntegrityGate\(\)/,'deferred final integrity gate must remain available');
  assert.match(block,/250\)/,'deep integrity gate should not block initial paint');
  assert.doesNotMatch(block,/const finalGate=finalIntegrityGate\(\);[^]*?el\.innerHTML/,'final gate must not be required before initial health render');
});
