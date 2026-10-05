import { readFileSync } from "node:fs";
import { test } from "node:test";
import assert from "node:assert/strict";

const source=readFileSync("web/room-ops-v9.js","utf8");

test("room QR is a permanent location entry point",()=>{
  assert.match(source,/window\.p6qr=\(kind,id\)=>\{if\(kind==='room'\)return showRoomQr\(id\)/);
  assert.match(source,/mta:\/\/room\/'\+id\+'/);
  assert.match(source,/d\.qr\.room\[id\]/);
  assert.match(source,/QR_ROOM_STATE/);
});

test("room operational detail derives occupants from active placement",()=>{
  assert.match(source,/function activeResidents\(d,room\)/);
  assert.match(source,/currentPlacement\(d,x\.id\)/);
  assert.match(source,/x\.status==='AKTIF'/);
  assert.match(source,/PLACEMENT AKTIF/);
  assert.match(source,/KAPASITAS/);
});

test("room QR view is read-only and does not create a second mutation seam",()=>{
  assert.match(source,/MTADeteniDomainCommandsV2\.roomQrState/);
  assert.doesNotMatch(source,/d\.rooms\.push\(/);
  assert.doesNotMatch(source,/d\.placements\.push\(/);
  assert.doesNotMatch(source,/d\.detainees\.push\(/);
});

test("room QR remains permanent while occupancy data stays dynamic",()=>{
  assert.match(source,/QR permanen mengidentifikasi lokasi/);
  assert.match(source,/Penghuni selalu diambil dari placement aktif/);
  assert.match(source,/Source of truth: Master Room \+ Placement Aktif/);
});


test("room QR opens as modal and supports print",()=>{
  assert.match(source,/function showRoomQr\(id\)\{installRoomQrStyle\(\);/);
  assert.match(source,/data-print-room-qr/);
  assert.match(source,/window\.open\('','_blank'/);
  assert.match(source,/printWindow\.print\(\)/);
});


test("room QR print window writes printable QR content before print",()=>{
  assert.match(source,/printWindow\.document\.open\(\)/);
  assert.match(source,/printWindow\.document\.write\(/);
  assert.match(source,/setTimeout\(\(\)=>\{try\{printWindow\.focus\(\);printWindow\.print\(\)/);
  assert.match(source,/360px/);
});
