import assert from "node:assert/strict"; import {test} from "node:test";
const u=new URL("../src/infrastructure/database/document-repository-runtime-contract.ts",import.meta.url);
test("P10.33 maps document lifecycle to observed production table",async()=>{const m=await import(u);assert.equal(m.DOCUMENT_TABLE,"public.mta_documents");assert.equal(m.DOCUMENT_COLUMN_MAP.integrityHash,"integrity_hash");assert.equal(m.DOCUMENT_COLUMN_MAP.finalizedAt,"finalized_at");});
test("P10.33 preserves revision-aware repository operations",async()=>{const m=await import(u);assert.ok(m.DOCUMENT_REPOSITORY_RUNTIME_CONTRACT_VERSION);});
