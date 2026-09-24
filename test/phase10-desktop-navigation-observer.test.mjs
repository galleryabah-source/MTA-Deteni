import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const source=fs.readFileSync(new URL('../web/desktop-shell-v2.js',import.meta.url),'utf8');

test('Phase 10 desktop navigation grouping is idempotent under MutationObserver',()=>{
  assert.match(source,/function groupNav\(nav\)\{/);
  assert.match(source,/const alreadyNormalized=/);
  assert.match(source,/if\(alreadyNormalized\)\{/);
  assert.match(source,/nav\.dataset\.desktopGrouped='1'/);
  assert.match(source,/new MutationObserver\(\(\)=>\{groupNav\(nav\);syncA11y\(nav\)\}\)/);
  assert.match(source,/nav\.appendChild\(b\)/);
});
