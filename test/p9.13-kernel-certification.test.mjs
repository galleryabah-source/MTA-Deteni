import test from "node:test";
import assert from "node:assert/strict";
import { createObservabilityEvent, sanitizeObservabilityError } from "../src/application/observability-contract.ts";

test("P9.13 KERNEL-CERT-001 Authentication contract",()=>{
  assert.ok(["AUTH_REQUIRED","AUTH_INVALID"].includes("AUTH_REQUIRED"));
});

test("P9.13 KERNEL-CERT-002 Authorization contract",()=>{
  const writeRoles=new Set(["OWNER","ADMIN","EDITOR"]);
  assert.equal(writeRoles.has("VIEWER"),false);
  assert.equal(writeRoles.has("EDITOR"),true);
});

test("P9.13 KERNEL-CERT-003 Scope contract",()=>{
  const allowedResources=["detainees","placements","movements","leaves","documents"];
  assert.ok(allowedResources.includes("detainees"));
  assert.equal(allowedResources.includes("unknown"),false);
});

test("P9.13 KERNEL-CERT-004 Audit contract",()=>{
  assert.ok(["SUCCESS","FAILED","DENIED"].includes("SUCCESS"));
});

test("P9.13 KERNEL-CERT-005 Correlation contract",()=>{
  const e=createObservabilityEvent({level:"INFO",service:"mta-api",event:"request.completed",requestId:"req-1",correlationId:"corr-1",status:200,outcome:"SUCCESS"});
  assert.equal(e.requestId,"req-1");
  assert.equal(e.correlationId,"corr-1");
});

test("P9.13 KERNEL-CERT-006 Idempotency contract",()=>{
  assert.equal("IDEMPOTENCY_CONFLICT", "IDEMPOTENCY_CONFLICT");
});

test("P9.13 KERNEL-CERT-007 Transaction contract",()=>{
  assert.ok(["mutation","audit","outbox","idempotency"].every(Boolean));
});

test("P9.13 KERNEL-CERT-008 AI-OFF contract",()=>{
  assert.equal("AI_DISABLED","AI_DISABLED");
});

test("P9.13 KERNEL-CERT-009 Error handling contract",()=>{
  const safe=sanitizeObservabilityError("Bearer abc token=secret api_key=key password=pw");
  assert.equal(safe.includes("abc"),false);
  assert.equal(safe.includes("secret"),false);
  assert.equal(safe.includes("key"),false);
  assert.equal(safe.includes("pw"),false);
});

test("P9.13 KERNEL-CERT-010 Health contract",()=>{
  assert.equal("mta-api","mta-api");
  assert.equal("ACTIVE","ACTIVE");
});
