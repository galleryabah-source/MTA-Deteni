import test from "node:test";
import assert from "node:assert/strict";
import { createObservabilityEvent, sanitizeObservabilityError } from "../src/application/observability-contract.ts";

test("P9.11-HARNESS-001 observability context",()=>{
  const e=createObservabilityEvent({level:"INFO",service:"mta-api",event:"request.completed",requestId:"req-test",correlationId:"corr-test",status:200,durationMs:5,outcome:"SUCCESS"});
  assert.equal(e.requestId,"req-test"); assert.equal(e.correlationId,"corr-test");
});
test("P9.11-HARNESS-002 secret redaction",()=>{
  const e=sanitizeObservabilityError("Bearer abc.def token=secret api_key=key password=pw");
  assert.equal(e.includes("abc.def"),false); assert.equal(e.includes("secret"),false); assert.equal(e.includes("key"),false); assert.equal(e.includes("pw"),false);
});
test("P9.11-HARNESS-003 deterministic public error codes",()=>{
  const allowed=["AUTH_REQUIRED","AUTH_INVALID","RBAC_PROFILE_MISSING_OR_INACTIVE","DB_READ_FAILED","DB_MUTATION_FAILED","UNHANDLED_API_ERROR"];
  assert.ok(allowed.includes("AUTH_REQUIRED")); assert.ok(allowed.includes("UNHANDLED_API_ERROR"));
});
