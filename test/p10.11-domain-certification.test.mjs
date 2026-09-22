import test from "node:test"; import assert from "node:assert/strict";
import {P10_DOMAIN_CERTS,assertNoSchemaMutation,assertP10DomainCertification} from "../src/application/p10-domain-certification.ts";
test("P10.11-CERT-001 certification catalog",()=>assert.equal(P10_DOMAIN_CERTS.length,10));
test("P10.11-CERT-002 incomplete domain certification rejected",()=>assert.throws(()=>assertP10DomainCertification(Object.fromEntries(P10_DOMAIN_CERTS.map(k=>[k,k==="DETAINEE"])) as any),/INCOMPLETE/));
test("P10.11-CERT-003 complete domain certification accepted",()=>assert.doesNotThrow(()=>assertP10DomainCertification(Object.fromEntries(P10_DOMAIN_CERTS.map(k=>[k,true])) as any)));
test("P10.11-CERT-004 schema mutation forbidden",()=>assert.throws(()=>assertNoSchemaMutation({migrationExecuted:true}),/SCHEMA_MUTATION/));
test("P10.11-CERT-005 migration-free accepted",()=>assert.doesNotThrow(()=>assertNoSchemaMutation({migrationExecuted:false})));