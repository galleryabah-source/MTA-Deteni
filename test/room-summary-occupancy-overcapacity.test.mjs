import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const runtime=fs.readFileSync('web/mta-app-runtime-full.js','utf8');
const match=runtime.match(/function roomSummary\(\)\{[\s\S]*?\n\}\nfunction roomSummaryCard/);
assert.ok(match,'roomSummary function must exist');
const roomSummarySource=match[0].replace(/\nfunction roomSummaryCard[\s\S]*$/,'');
const context={db:{
  rooms:[
    {id:'ROOM-1',capacity:2,status:'ACTIVE'},
    {id:'ROOM-2',capacity:4,status:'ACTIVE'},
    {id:'ROOM-3',capacity:1,status:'ACTIVE'}
  ],
  detainees:[
    {id:'D-1',status:'AKTIF'},
    {id:'D-2',status:'AKTIF'},
    {id:'D-3',status:'AKTIF'},
    {id:'D-4',status:'AKTIF'},
    {id:'D-5',status:'AKTIF'},
    {id:'D-6',status:'NONAKTIF'}
  ],
  placements:[
    {id:'P-1',detaineeId:'D-1',roomId:'ROOM-1',since:'2026-09-27T01:00:00Z'},
    {id:'P-2',detaineeId:'D-2',roomId:'ROOM-1',since:'2026-09-27T02:00:00Z'},
    {id:'P-3',detaineeId:'D-3',roomId:'ROOM-1',since:'2026-09-27T03:00:00Z'},
    {id:'P-4',detaineeId:'D-4',roomId:'ROOM-2',since:'2026-09-27T04:00:00Z'},
    {id:'P-5',detaineeId:'D-5',roomId:'ROOM-2',since:'2026-09-27T05:00:00Z'},
    {id:'P-6',detaineeId:'D-6',roomId:'ROOM-3',since:'2026-09-27T06:00:00Z'}
  ]
}};
vm.createContext(context);
vm.runInContext(roomSummarySource + '; globalThis.result=roomSummary();',context);
const result=context.result;
assert.equal(result.totalRooms,3);
assert.equal(result.occupiedRooms,2);
assert.equal(result.capacity,7);
assert.equal(result.totalDetaineesInRooms,5);
assert.equal(result.overcapacity,1);
assert.equal(result.overcapacityRooms,1);
assert.equal(result.occupiedByRoom.get('ROOM-1'),3);
assert.equal(result.occupiedByRoom.get('ROOM-2'),2);
assert.equal(result.occupiedByRoom.get('ROOM-3'),0);
console.log('ROOM_SUMMARY_OCCUPANCY_OVER_CAPACITY_TEST: PASS');
