import assert from "node:assert/strict";
import test from "node:test";
import {
  PRIVATE_STORAGE_CONTRACT_VERSION,
  decidePrivateStorageAccess,
  validatePrivateStorageObject,
} from "../src/infrastructure/storage/private-storage-contract";

const object = {
  objectId: "obj-001",
  bucket: "mta-deteni-private",
  objectPath: "synthetic/documents/doc-001.pdf",
  classification: "RESTRICTED" as const,
  contentHash: "a".repeat(64),
  contentType: "application/pdf",
  sizeBytes: 1024,
};

test("P9.9 exposes a versioned private storage contract", () => {
  assert.equal(PRIVATE_STORAGE_CONTRACT_VERSION, "P9.9-v1");
});

test("valid private object metadata passes validation", () => {
  assert.doesNotThrow(() => validatePrivateStorageObject(object));
});

test("missing object path is rejected", () => {
  assert.throws(
    () => validatePrivateStorageObject({ ...object, objectPath: "" }),
    /STORAGE_OBJECTPATH_REQUIRED/,
  );
});

test("unauthenticated access is denied", () => {
  assert.deepEqual(
    decidePrivateStorageAccess({
      authenticated: false,
      scopeAllowed: true,
      classificationAllowed: true,
    }),
    { allowed: false, reasonCode: "AUTH_REQUIRED" },
  );
});

test("scope and classification boundaries are enforced", () => {
  assert.equal(
    decidePrivateStorageAccess({
      authenticated: true,
      scopeAllowed: false,
      classificationAllowed: true,
    }).reasonCode,
    "SCOPE_DENIED",
  );

  assert.equal(
    decidePrivateStorageAccess({
      authenticated: true,
      scopeAllowed: true,
      classificationAllowed: false,
    }).reasonCode,
    "CLASSIFICATION_DENIED",
  );
});

test("authorized access is explicitly allowed", () => {
  assert.deepEqual(
    decidePrivateStorageAccess({
      authenticated: true,
      scopeAllowed: true,
      classificationAllowed: true,
    }),
    { allowed: true, reasonCode: "AUTHORIZED" },
  );
});
