import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const html=fs.readFileSync(new URL('../web/index.html',import.meta.url),'utf8');
const movement=fs.readFileSync(new URL('../web/movement-v9.js',import.meta.url),'utf8');
const unified=fs.readFileSync(new URL('../web/mta-unified-shell-v2.js',import.meta.url),'utf8');

test('F11 core journey keeps placement governed by Master Kamar',()=>{
  assert.match(html,/function addPlacement\(\)\{/);
  assert.match(html,/filter\(r=>r\.status==='ACTIVE'\)/);
  assert.match(html,/select name="roomId"/);
  assert.match(html,/const requestKey='PLACEMENT:'\+id\+':'\+master\.id/);
  assert.match(html,/PLACEMENT_ASSIGN/);
  assert.doesNotMatch(html,/name="block" required placeholder="Blok A"/);
  assert.doesNotMatch(html,/name="room" required placeholder="Kamar 01"/);
});

test('F11 detainee and leave mutations preserve identity and idempotency boundaries',()=>{
  assert.match(html,/DETAINEE_WRITE_BLOCKED/);
  assert.match(html,/DETAINEE_CREATE/);
  assert.match(html,/function addLeave\(\)/);
  assert.match(html,/LEAVE_CREATE:/);
  assert.match(html,/LEAVE_CREATE_BLOCKED/);
  assert.match(html,/window\.mtaCoreJourneyContractTest=mtaCoreJourneyContractTest/);
  assert.match(html,/if\(!state\.detainees\.length\)/);
  assert.match(html,/CORE_ROOM_CAPACITY/);
  assert.match(html,/function mtaCoreJourneySimulationTest\(\)/);
  assert.match(html,/persisted:false/);
});

test('F11 movement remains Master Kamar and capacity governed',()=>{
  assert.match(movement,/rooms=d\.rooms\.filter\(x=>x\.status==='ACTIVE'/);
  assert.match(movement,/requestKey='ROOM_TRANSFER:'/);
  assert.match(movement,/to\.status!=='ACTIVE'/);
  assert.match(movement,/occ\(d,to,id\)>/);
  assert.match(movement,/MOVEMENT_CREATE/);
  assert.match(movement,/PLACEMENT_ASSIGN/);
});

test('F11 unified shell still exposes operational journey contracts',()=>{
  assert.match(unified,/mtaUnifiedValidateMovement/);
  assert.match(unified,/mtaUnifiedValidateLeave/);
  assert.match(unified,/mtaUnifiedMutationConsistencyContractTest/);
  assert.match(unified,/mtaUnifiedJourneyOperationalContractTest/);
  assert.match(unified,/x\.status==='ACTIVE'&&x\.id!==currentPlacement\?\.roomId/);
});
