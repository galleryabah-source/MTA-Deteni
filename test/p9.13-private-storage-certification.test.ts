import test from "node:test";
import assert from "node:assert/strict";
import { createPrivateStorageObject, assertPrivateStorageReplaySafe } from "../src/application/private-storage-contract.ts";

const base = {
  objectId:"OBJ-SYN-001",
  storageKey:"private/synthetic/OBJ-SYN-001.pdf",
  classification:"PRIVATE" as const,
  contentFingerprint:"sha256-synthetic",
  contentType:"application/pdf",
  sizeBytes:128,
  createdAt:"2026-09-26T00:00:00.000Z",
};

test("private storage admits a valid immutable object",()=>{
  const object=createPrivateStorageObject(base);
  assert.equal(Object.isFrozen(object),true);
  assert.equal(object.classification,"PRIVATE");
});

test("private storage rejects invalid classification and size",()=>{
  assert.throws(()=>createPrivateStorageObject({...base,classification:"PUBLIC" as never}),/PRIVATE_STORAGE_CLASSIFICATION_INVALID/);
  assert.throws(()=>createPrivateStorageObject({...base,sizeBytes:-1}),/PRIVATE_STORAGE_SIZE_INVALID/);
});

test("private storage replay requires identical object identity and content",()=>{
  const existing=createPrivateStorageObject(base);
  assert.doesNotThrow(()=>assertPrivateStorageReplaySafe(existing,{...base}));
  assert.throws(()=>assertPrivateStorageReplaySafe(existing,{...base,storageKey:"private/other"}),/PRIVATE_STORAGE_IDENTITY_MISMATCH/);
  assert.throws(()=>assertPrivateStorageReplaySafe(existing,{...base,contentFingerprint:"drift"}),/PRIVATE_STORAGE_CONTENT_DRIFT/);
});
