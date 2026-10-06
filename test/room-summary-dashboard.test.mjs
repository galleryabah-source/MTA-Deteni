import assert from 'node:assert/strict';
import fs from 'node:fs';

const runtime=fs.readFileSync('web/mta-app-runtime-full.js','utf8');

assert.match(runtime,/function roomSummary\(\)/);
assert.match(runtime,/totalRooms:rooms\.length/);
assert.match(runtime,/if\(d\?\.status!==['"]AKTIF['"]\)continue/);
assert.match(runtime,/const latestPlacement=new Map\(\)/);
assert.match(runtime,/occupiedRooms/);
assert.match(runtime,/capacity=rooms\.reduce/);
assert.match(runtime,/Room Summary/);
assert.match(runtime,/Total Kamar/);
assert.match(runtime,/Kamar Terisi/);
assert.match(runtime,/Kapasitas/);
assert.match(runtime,/\$\{roomSummaryCard\(\)\}/);

const index=fs.readFileSync('web/index.html','utf8');
const coreRuntime=fs.readFileSync('web/mta-app-runtime.js','utf8');
assert.match(index,/mta-room-summary-dashboard-v2/);
assert.match(index,/mta-app-runtime\.js\?v=13/);
assert.match(index,/mta-app-runtime-full\.js\?v=25/);

console.log('ROOM_SUMMARY_DASHBOARD_TEST: PASS');
