import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const source=fs.readFileSync(new URL('../web/index.html',import.meta.url),'utf8');

test('Data Deteni table header and row column contract stay aligned',()=>{
  assert.match(source,/const rows=db\.detainees\.map\(\(d,i\)=>/);
  assert.match(source,/<td>\$\{i\+1\}<\/td><td><b>\$\{esc\(d\.code\)\}<\/b><\/td><td>\$\{esc\(d\.name\)\}<\/td><td>\$\{esc\(d\.nationality\)\}<\/td>/);
  assert.match(source,/<th>No<\/th><th>Kode<\/th><th>Nama<\/th><th>Kebangsaan<\/th><th>Status<\/th><th>Penempatan<\/th><th>Aksi<\/th>/);
});
