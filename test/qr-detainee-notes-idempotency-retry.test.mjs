import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = path => readFile(new URL("../" + path, import.meta.url), "utf8");

test("note retries retain one idempotency key and stable event timestamp", async () => {
  const shell = await read("web/mta-unified-shell-v2.js");
  assert.match(shell, /activityForm\.dataset\.idempotencyKey=activityForm\.dataset\.idempotencyKey\|\|\('ACTIVITY_NOTE:'/);
  assert.match(shell, /healthForm\.dataset\.idempotencyKey=healthForm\.dataset\.idempotencyKey\|\|\('HEALTH_RECORD:'/);
  assert.match(shell, /occurredAt:activityForm\.dataset\.occurredAt/);
  assert.match(shell, /occurredAt:healthForm\.dataset\.examinedAt/);
  assert.match(shell, /activityForm\.dataset\.operationPayload=JSON\.stringify\(operation\)/);
  assert.match(shell, /healthForm\.dataset\.operationPayload=JSON\.stringify\(operation\)/);
  assert.match(shell, /const operation=pending\|\|\{noteType:/);
  assert.match(shell, /const operation=pending\|\|\{examType:/);
  assert.match(shell, /Percobaan ulang akan menggunakan payload dan kunci operasi yang sama/);
  assert.match(shell, /delete activityForm\.dataset\.operationPayload/);
  assert.match(shell, /delete healthForm\.dataset\.operationPayload/);
  assert.match(shell, /mtaActivityContent'\)\.value=operation\.content/);
  assert.match(shell, /mtaHealthFindings'\)\.value=operation\.content/);
  assert.match(shell, /delete activityForm\.dataset\.idempotencyKey/);
  assert.match(shell, /delete healthForm\.dataset\.idempotencyKey/);
});

test("note request hash excludes per-attempt request and correlation IDs", async () => {
  const api = await read("supabase/functions/mta-api/index.ts");
  assert.match(api, /const payload=\{kind,targetId,noteType,content,examType,actionTaken,followUp,examinedAt,actor:user\.id\};/);
  assert.doesNotMatch(api, /const payload=\{[^}]*requestId:requestIdNote/);
  assert.doesNotMatch(api, /const payload=\{[^}]*correlationId:correlationIdNote/);
});
