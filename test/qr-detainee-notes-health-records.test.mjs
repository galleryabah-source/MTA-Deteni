import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("QR detainee action offers append-only activity and healthcare note capture", async () => {
  const shell = await readFile(new URL("../web/mta-unified-shell-v1.js", import.meta.url), "utf8");
  assert.match(shell, /Catatan Kegiatan & Kondisi Deteni/);
  assert.match(shell, /Perawatan & Kesehatan/);
  assert.match(shell, /mtaDetaineeNoteForm/);
  assert.match(shell, /mtaHealthNoteForm/);
  assert.match(shell, /appendDetaineeNote/);
  assert.match(shell, /appendOnly:true/);
  assert.match(shell, /DETAINEE_NOTE_CREATE/);
  assert.match(shell, /DETAINEE_HEALTH_NOTE_CREATE/);
  assert.match(shell, /requestId:uid\('REQ'\)/);
  assert.match(shell, /correlationId:uid\('COR'\)/);
  assert.match(shell, /Preview saat ini menyimpan data synthetic di browser/);
});

test("QR note capture stays attached to the resolved detainee and does not overwrite history", async () => {
  const shell = await readFile(new URL("../web/mta-unified-shell-v1.js", import.meta.url), "utf8");
  assert.match(shell, /filter\(n=>n\.detaineeId===id\)/);
  assert.match(shell, /d\.detaineeNotes\.unshift\(record\)/);
  assert.match(shell, /maxlength="4000"/);
  assert.match(shell, /restricted:true/);
});
