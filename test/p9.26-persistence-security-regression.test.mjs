import assert from "node:assert/strict"; import test from "node:test"; import {evaluatePersistenceSecurity} from "../src/infrastructure/security/persistence-security-regression.ts";
const b={rlsEnforced:true,serviceCredentialIsolated:true,auditMandatory:true,outboxAtomic:true,migrationFrozen:true,aiDisabled:true};
test("complete persistence security evidence passes",()=>assert.equal(evaluatePersistenceSecurity(b),"PASS"));
test("RLS failure blocks",()=>assert.equal(evaluatePersistenceSecurity({...b,rlsEnforced:false}),"FAIL"));
test("credential isolation failure blocks",()=>assert.equal(evaluatePersistenceSecurity({...b,serviceCredentialIsolated:false}),"FAIL"));
test("audit failure blocks",()=>assert.equal(evaluatePersistenceSecurity({...b,auditMandatory:false}),"FAIL"));