import { readFileSync } from 'node:fs';import { strict as assert } from 'node:assert';const s=readFileSync(new URL('../web/detainee-statistics-v1.js',import.meta.url),'utf8'),i=readFileSync(new URL('../web/index.html',import.meta.url),'utf8');assert.match(s,/Total Deteni/);assert.match(s,/Kebangsaan/);assert.match(s,/Penempatan/);assert.match(s,/Jenis Pergerakan/);assert.match(s,/Status Izin/);assert.match(s,/Jenis Dokumen/);assert.match(s,/Deteni tanpa penempatan/);assert.match(s,/function operationalRows/);assert.match(s,/Download Tabel/);assert.match(s,/Cetak Tabel/);assert.match(s,/application\/msword/);assert.match(s,/iframe/);assert.doesNotMatch(s,/s\.audit|audit\[|auditTrail/);assert.doesNotMatch(s,/s\.audit|audit\[|auditTrail/);assert.match(i,/detainee-statistics-v1\.js/);console.log('MTA-F-20260926-003 detainee operational statistics static contract: PASS');
assert.match(s,/v==='detainee-statistics'\|\|v==='statistics'/);
assert.match(s,/window\.MTADetaineeStatisticsView/);

assert.match(s,/Deteni Aktif/);
assert.match(s,/Tren Input Deteni/);
assert.match(s,/Indikator Ekosistem Deteni/);
assert.match(s,/Deteni dengan izin/);
assert.match(s,/Deteni dengan dokumen/);
assert.match(s,/mta:data-changed/);
assert.match(s,/window\.MTADetaineeStatisticsView=Object\.freeze/);
console.log('MTA-F-20260926-003 statistics calculation/reporting contract: PASS');