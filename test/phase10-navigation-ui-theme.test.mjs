import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css=fs.readFileSync(new URL('../web/desktop-shell-v2.css',import.meta.url),'utf8');
const js=fs.readFileSync(new URL('../web/desktop-shell-v2.js',import.meta.url),'utf8');

test('Phase 10 desktop navigation uses one canonical SVG icon layer',()=>{
  assert.match(js,/const ICONS=\{/);
  assert.match(js,/b\.dataset\.icon=ICONS\[view\]\|\|'•'/);\n  assert.match(js,/NAV_LABELS=\{/);\n  assert.match(js,/if\(nav\.querySelector\('button\[data-view="'\+view\+'"\]\)\)return/);
  assert.match(css,/nav button::before\{content:none!important;display:none!important\}/);
  assert.match(css,/mta-desktop-group-label/);
  assert.match(css,/mta-desktop-group-label/);
});