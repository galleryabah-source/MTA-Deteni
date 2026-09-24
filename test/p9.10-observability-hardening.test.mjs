import test from "node:test";
import assert from "node:assert/strict";
import {redactValue,createObservabilityEvent,assertObservabilityContinuity,createMetricSample} from "../src/infrastructure/observability/observability-runtime.mjs";

test("P9.10 redacts nested secrets and preserves arrays",()=>{
 const value=redactValue({token:"x",nested:{password:"p",safe:"ok"},items:[{access_token:"a",safe:1}]});
 assert.deepEqual(value,{token:"[REDACTED]",nested:{password:"[REDACTED]",safe:"ok"},items:[{access_token:"[REDACTED]",safe:1}]});
});

test("P9.10 event rejects invalid level and preserves context",()=>{
 assert.throws(()=>createObservabilityEvent({eventName:"x",requestId:"r",correlationId:"c",occurredAt:"t",level:"TRACE"}),/OBSERVABILITY_LEVEL_INVALID/);
 const e=createObservabilityEvent({eventName:"x",requestId:"r",correlationId:"c",occurredAt:"t",metadata:{secret:"x"}});
 assert.equal(e.metadata.secret,"[REDACTED]");
 assert.equal(assertObservabilityContinuity(e,{requestId:"r",correlationId:"c"}),true);
 assert.throws(()=>assertObservabilityContinuity(e,{requestId:"other",correlationId:"c"}),/OBSERVABILITY_CONTEXT_MISMATCH/);
});

test("P9.10 metrics are finite and correlated",()=>{
 const m=createMetricSample({name:"mutation.duration_ms",value:12.5,requestId:"r",correlationId:"c",occurredAt:"t"});
 assert.equal(m.value,12.5);
 assert.throws(()=>createMetricSample({name:"x",value:Infinity,requestId:"r",correlationId:"c",occurredAt:"t"}),/METRIC_VALUE_INVALID/);
});
