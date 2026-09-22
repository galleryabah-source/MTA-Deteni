import test from "node:test";
import assert from "node:assert/strict";
import { createObservabilityEvent, sanitizeObservabilityError, serializeObservabilityEvent } from "../src/application/observability-contract.ts";

test("P9.10 creates correlated structured events",()=>{
  const event=createObservabilityEvent({level:"INFO",service:"mta-api",event:"request.completed",requestId:"req-1",correlationId:"corr-1",method:"GET",route:"/detainees",status:200,durationMs:12,outcome:"SUCCESS"});
  assert.equal(event.requestId,"req-1"); assert.equal(event.correlationId,"corr-1"); assert.equal(event.status,200); assert.equal(event.outcome,"SUCCESS"); assert.match(serializeObservabilityEvent(event),/request.completed/);
});

test("P9.10 rejects missing correlation context",()=>{
  assert.throws(()=>createObservabilityEvent({level:"INFO",service:"mta-api",event:"request.started",requestId:"",correlationId:"corr-1"}),/OBS_REQUEST_ID_REQUIRED/);
  assert.throws(()=>createObservabilityEvent({level:"INFO",service:"mta-api",event:"request.started",requestId:"req-1",correlationId:""}),/OBS_CORRELATION_ID_REQUIRED/);
});

test("P9.10 sanitizes secret-like error material",()=>{
  const safe=sanitizeObservabilityError("Bearer abc.def.ghi api_key=supersecret password=hunter2");
  assert.doesNotMatch(safe,/abc\\.def\\.ghi/); assert.doesNotMatch(safe,/supersecret/); assert.doesNotMatch(safe,/hunter2/);
});
