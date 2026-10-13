import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("QR detainee action offers append-only activity and healthcare note capture", async () => {
  const shell = await readFile(new URL("../web/mta-unified-shell-v2.js", import.meta.url), "utf8");
  assert.match(shell, /Catatan Kegiatan & Kondisi Deteni/);
  assert.match(shell, /Perawatan & Kesehatan/);
  assert.match(shell, /mtaActivityNoteForm/);
  assert.match(shell, /mtaHealthRecordForm/);
  assert.match(shell, /getDetaineeNotes\(id,'ACTIVITY'\)/);
  assert.match(shell, /getDetaineeNotes\(id,'HEALTH'\)/);
  assert.match(shell, /Simpan ke Database/);
  assert.match(shell, /Simpan Rekam Kesehatan/);
  assert.match(shell, /database production belum terhubung/i);
  assert.match(shell, /Penyimpanan catatan dinonaktifkan/);
});

test("QR note capture stays attached to the resolved detainee and does not overwrite history", async () => {
  const shell = await readFile(new URL("../web/mta-unified-shell-v2.js", import.meta.url), "utf8");
  assert.match(shell, /mtaUnifiedOpenMovement/);
  assert.match(shell, /openQrDetaineeLeave\(id\)/);
  assert.match(shell, /openQrDetaineeDetail\(id\)/);
  assert.match(shell, /maxlength="4000"/);
  assert.match(shell, /RBAC_HEALTH_RECORD_ACCESS_DENIED/);
  assert.doesNotMatch(shell, /d\.detaineeNotes\.unshift\(record\)/);
  assert.doesNotMatch(shell, /localStorage\.setItem\([^\n]*detaineeNotes/);
});
