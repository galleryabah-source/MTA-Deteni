import assert from "node:assert/strict";
import test from "node:test";
import { validateDocument, validateDocumentCommand } from "../src/domain/document/document-registry-contract.js";

const synthetic = {
  documentId: "DOC-001",
  documentType: "SURAT_IZIN_KELUAR_SEMENTARA",
  subjectId: "SYN-001",
  templateVersion: "TPL-1",
  status: "GENERATED",
  contentHash: "a".repeat(64),
  generatedAt: "2026-09-21T08:00:00.000Z",
  verified: false,
};

test("inferred P10.6 accepts a valid synthetic document registry record", () => {
  assert.deepEqual(validateDocument(synthetic), []);
});

test("inferred P10.6 rejects an invalid content hash", () => {
  assert.deepEqual(validateDocument({ ...synthetic, contentHash: "bad" }), ["INVALID_CONTENT_HASH"]);
});

test("inferred P10.6 requires a void reason", () => {
  assert.deepEqual(validateDocumentCommand({
    type: "VOID", documentId: "DOC-001", reason: " "
  }), ["MISSING_REASON"]);
});
