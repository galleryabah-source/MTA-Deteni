import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const responsive=fs.readFileSync(new URL('../web/responsive-v11.css',import.meta.url),'utf8');
const mobile=fs.readFileSync(new URL('../web/mobile-shell-v1.js',import.meta.url),'utf8');
const unified=fs.readFileSync(new URL('../web/mta-unified-shell-v2.js',import.meta.url),'utf8');

test('Phase 10 mobile shell owns phone navigation and hides desktop sidebar',()=>{
  assert.match(responsive,/@media\(max-width:1024px\)\{[\s\S]*\.layout\{display:block!important;grid-template-columns:1fr!important\}[\s\S]*\.side\{display:none!important\}/);
  assert.match(mobile,/@media \(max-width:1024px\)/);
  assert.match(mobile,/\.side\{display:none!important\}/);
  assert.match(mobile,/\.mta-mobile-bottom/);
  assert.match(mobile,/\.mta-mobile-menu/);
  assert.match(unified,/\/responsive-v11\.css\?v=14/);
  assert.match(unified,/\/mobile-shell-v1\.js\?v=3/);
});
