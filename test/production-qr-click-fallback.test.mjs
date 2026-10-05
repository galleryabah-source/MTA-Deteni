import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const source=fs.readFileSync(new URL('../web/preview-v6.js',import.meta.url),'utf8');

assert.match(
  source,
  /window\.p6qr=\(kind,id\)=>\{const d=ensure\(\),map=kind==='room'\?'room':kind==='leave'\?'leave':'detainee',x=/
);

assert.match(
  source,
  /const q=d\.qr\[map\]\?\.\[id\]\|\|\{token:'SYNTH-QR-'\+id/
);

assert.match(
  source,
  /if\(!x\)\{toast\('Resource QR tidak ditemukan'\);return\}/
);

assert.match(
  source,
  /window\.p6printQR=\(kind,id\)=>\{const d=ensure\(\),map=kind==='room'\?'room':kind==='leave'\?'leave':'detainee',x=/
);

assert.match(
  source,
  /q=d\.qr\[map\]\?\.\[id\]\|\|\{token:'SYNTH-QR-'\+id/
);

console.log('QR production click fallback contract: PASS');


const runtime=fs.readFileSync(new URL('../web/mta-app-runtime-full.js',import.meta.url),'utf8');
assert.match(runtime,/function roomOccupancyMap\(state\)/);
assert.match(runtime,/\$\{occupancy\.get\(String\(r\.id\)\)\|\|0\}\/\$\{esc\(r\.capacity\)\}/);
console.log('Detainee room occupancy option contract: PASS');


test("clean QR print supports production detainee fallback and direct popup DOM rendering",()=>{
  const printSource=fs.readFileSync(new URL('../web/qr-print-clean-v3.js',import.meta.url),'utf8');
  assert.match(printSource,/q=d\.qr\?\.\[map\]\?\.\[id\]\|\|\(\(kind==='detainee'&&x\)\?\{token:'SYNTH-QR-'\+id/);
  assert.match(printSource,/const pdoc=w\.document/);
  assert.match(printSource,/pdoc\.createElement\('style'\)/);
  assert.match(printSource,/pdoc\.body\.appendChild\(box\)/);
  assert.match(printSource,/w\.print\(\)/);
});
