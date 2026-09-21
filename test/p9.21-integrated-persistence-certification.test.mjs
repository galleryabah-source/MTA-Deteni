import assert from "node:assert/strict";
import test from "node:test";
import { certifyIntegratedPersistence } from "../src/infrastructure/certification/integrated-persistence-certification.ts";

const base={adapter:"PASS",transaction:"PASS",repository:"PASS",auditRepository:"PASS",outboxRepository:"PASS",reconciliation:"PASS",migrationFreeze:true,productionMutation:false};

test("complete evidence certifies persistence boundary",()=>assert.equal(certifyIntegratedPersistence(base),"CERTIFIED"));
test("unverified evidence is not certified",()=>assert.equal(certifyIntegratedPersistence({...base,reconciliation:"UNVERIFIED"}),"NOT_CERTIFIED"));
test("migration freeze must remain enabled",()=>assert.equal(certifyIntegratedPersistence({...base,migrationFreeze:false}),"NOT_CERTIFIED"));
test("production mutation blocks certification",()=>assert.equal(certifyIntegratedPersistence({...base,productionMutation:true}),"NOT_CERTIFIED"));
