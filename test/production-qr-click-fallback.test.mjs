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

assert.match(source,/lastIndexOf\('\/'\)/);
