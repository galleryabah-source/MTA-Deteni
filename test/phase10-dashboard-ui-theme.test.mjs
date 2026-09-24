import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const source=fs.readFileSync(new URL('../web/index.html',import.meta.url),'utf8');

test('Phase 10 canonical dashboard UI contract',()=>{
  for(const marker of [
    'mta-dashboard-date','mta-dashboard-stats','mta-dashboard-two','mta-dashboard-bottom',
    'Alur Cepat','Status Sistem','Informasi Runtime','Aksi Cepat',
    'Manajemen Pengaturan','Backup & Restore','Lihat Audit Trail'
  ]) assert.ok(source.includes(marker), 'dashboard marker missing: '+marker);
  assert.match(source,/mta-quick-action primary/);
  assert.match(source,/mta-kpi-icon blue/);
});
