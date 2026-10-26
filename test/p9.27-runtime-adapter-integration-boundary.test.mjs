import assert from "node:assert/strict"; import test from "node:test"; import {evaluateRuntimeAdapter} from "../src/infrastructure/database/runtime-adapter-integration-boundary.ts";
const b={environment:"TEST",role:"APP_RUNTIME",connectionConfigured:true,secretsExternalized:true};
test("valid runtime adapter context is ready",()=>assert.equal(evaluateRuntimeAdapter(b),"READY"));
test("missing connection blocks",()=>assert.equal(evaluateRuntimeAdapter({...b,connectionConfigured:false}),"BLOCKED"));
test("inline secret configuration blocks",()=>assert.equal(evaluateRuntimeAdapter({...b,secretsExternalized:false}),"BLOCKED"));
test("production migration role blocks",()=>assert.equal(evaluateRuntimeAdapter({...b,environment:"PRODUCTION",role:"MIGRATION"}),"BLOCKED"));