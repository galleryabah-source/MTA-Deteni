import assert from 'node:assert/strict';
import fs from 'node:fs';

const runtime=fs.readFileSync('web/mta-app-runtime-full.js','utf8');

assert.match(runtime,/function roomSummary\(\)/);
assert.match(runtime,/totalRooms:rooms\.length/);
assert.match(runtime,/occupiedRooms/);
assert.match(runtime,/capacity=rooms\.reduce/);
assert.match(runtime,/Room Summary/);
assert.match(runtime,/Total Kamar/);
assert.match(runtime,/Kamar Terisi/);
assert.match(runtime,/Kapasitas/);
assert.match(runtime,/\$\{roomSummaryCard\(\)\}/);

const index=fs.readFileSync('web/index.html','utf8');
assert.match(index,/mta-room-summary-dashboard-v1/);
assert.match(index,/mta-app-runtime-full\.js\?v=21/);

console.log('ROOM_SUMMARY_DASHBOARD_TEST: PASS');
